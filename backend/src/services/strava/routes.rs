use std::{collections::HashMap, sync::LazyLock};

use anyhow::anyhow;
use axum::{
    extract::{Query, State},
    http::HeaderMap,
    routing::{delete, get, post},
    Extension, Json, Router,
};
use axum::routing::put;
use chrono::{Duration, NaiveDateTime, Utc};
use reqwest::StatusCode;
use serde::Deserialize;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::{
    services::{
        auth::models::SessionModel,
        bikes::{
            repository::BikeRepository,
            rides::{models::RidePartial, repository::RideRepository},
        },
    },
    utility::{
        error::{AppError, AppResult},
        state::AppState,
    },
};
use crate::services::strava::api::no_auth::StravaApiNoAuth;
use crate::services::strava::models::{OAuthUrl, StravaLinkPartial};
use super::{
    api::models::{ActivityFilter, SummaryGear},
    extractor::Strava,
    models::{StravaLink, StravaModel},
    repository::StravaRepository,
};

const SCOPES: &[&str] = &["read_all", "profile:read_all", "activity:read_all"];
const TIMEOUT_SECONDS: i64 = 10 * 60;

static STATES: LazyLock<Mutex<HashMap<Uuid, (i64, NaiveDateTime)>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

async fn clear_states() {
    let states = &(*STATES);
    let mut states = states.lock().await;

    let now = Utc::now().naive_utc();
    let expired: Vec<_> = states
        .iter()
        .filter_map(|(state, (_, created))| {
            if now.signed_duration_since(*created).num_seconds() > TIMEOUT_SECONDS {
                Some(*state)
            } else {
                None
            }
        })
        .collect();

    for state in expired {
        states.remove(&state);
    }
}

async fn keep_fresh_token(model: StravaModel, repo: &StravaRepository, api: &StravaApiNoAuth) -> AppResult<StravaModel> {
    let now = Utc::now().naive_utc() - Duration::minutes(1);
    if model.expires_at > now {
        return Ok(model);
    }

    let model = api.refresh_token(model).await?;
    repo.update(model.clone()).await?;
    Ok(model)
}

#[derive(Deserialize)]
struct OAuthQuery {
    state: Uuid,
    code: String,
    #[serde(rename = "scope")]
    scopes: String,
}

pub fn router() -> Router<AppState> {
    Router::new().route("/redirect", get(redirect))
}

pub fn router_with_auth() -> Router<AppState> {
    Router::new()
        .route("/link", get(oauth))
        .route("/link", delete(unlink))
        .route("/", get(get_link))
        .route("/bikes", get(bikes))
        .route("/", post(sync))
        .route("/", put(update_link))
}

async fn oauth(
    Strava(config, _): Strava,
    Extension(session): Extension<SessionModel>,
) -> AppResult<(StatusCode, Json<OAuthUrl>)> {
    let state = Uuid::new_v4();
    let scope = SCOPES.join(",");
    let oauth = config.oauth_url("/api/strava/redirect", scope, state.to_string());

    let user_id = session.user_id;
    let now = Utc::now().naive_utc();

    clear_states().await;
    let states = &(*STATES);
    let mut states = states.lock().await;
    states.insert(state, (user_id, now));

    Ok((StatusCode::OK, Json(OAuthUrl { url: oauth })))
}

async fn redirect(
    Strava(_, api): Strava,
    State(repo): State<StravaRepository>,
    Query(query): Query<OAuthQuery>,
) -> AppResult<(StatusCode, HeaderMap)> {
    let scopes = query
        .scopes
        .split(',')
        .map(|s| s.to_lowercase())
        .collect::<Vec<_>>();
    for expected in SCOPES {
        if !scopes.contains(&expected.to_string()) {
            return Err(AppError::Other(anyhow!("Missing scope '{expected}'")));
        }
    }

    clear_states().await;
    let states = &(*STATES);
    let mut states = states.lock().await;

    let (user_id, _) = states
        .remove(&query.state)
        .ok_or_else(|| anyhow!("Invalid state"))?;

    let model = api.issue_token(&query.code, user_id).await?;
    repo.create(model).await?;

    let mut headers = HeaderMap::new();
    headers.insert("Location", "/settings".parse().unwrap());

    Ok((StatusCode::TEMPORARY_REDIRECT, headers))
}

async fn unlink(
    Extension(session): Extension<SessionModel>,
    State(repo): State<StravaRepository>,
) -> AppResult<StatusCode> {
    repo.delete(session.user_id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn get_link(
    Extension(session): Extension<SessionModel>,
    State(repo): State<StravaRepository>,
) -> AppResult<Json<StravaLink>> {
    let model = repo.try_get(session.user_id).await?;
    model
        .map(StravaLink::from)
        .map(Json)
        .ok_or_else(|| AppError::NotFound("Strava account not linked".to_string()))
}

async fn bikes(
    Extension(session): Extension<SessionModel>,
    State(repo): State<StravaRepository>,
    Strava(_, api): Strava,
) -> AppResult<Json<Vec<SummaryGear>>> {
    let link = repo
        .try_get(session.user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Strava account not linked".to_string()))?;

    let link = keep_fresh_token(link, &repo, &api).await?;
    let api = api.with_auth(&link)?;
    let athlete = api.get_athlete().await?;

    Ok(Json(athlete.bikes))
}

async fn sync(
    Extension(session): Extension<SessionModel>,
    State(repo): State<StravaRepository>,
    State(rides): State<RideRepository>,
    State(bikes): State<BikeRepository>,
    Strava(_, api): Strava,
) -> AppResult<(StatusCode, String)> {
    let link = repo
        .try_get(session.user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Strava account not linked".to_string()))?;

    let link = keep_fresh_token(link, &repo, &api).await?;
    let api = api.with_auth(&link)?;

    let mut bike_cache = HashMap::new();
    let mut filter = ActivityFilter {
        after: Some(link.last_sync),
        ..Default::default()
    };
    let mut strava_rides = api.get_activities(&filter).await?;
    while !strava_rides.is_empty() {
        for ride in strava_rides {
            let bike_ids = match bike_cache.get(&ride.gear_id) {
                Some(ids) => ids,
                None => {
                    let bikes = bikes
                        .get_by_strava_gear(session.user_id, ride.gear_id.as_deref())
                        .await?
                        .into_iter()
                        .map(|bike| bike.id)
                        .collect::<Vec<_>>();
                    
                    bike_cache.insert(ride.gear_id.clone(), bikes.clone());
                    bike_cache.get(&ride.gear_id).unwrap()
                }
            };

            let new = RidePartial {
                date: ride.start_date_local.date_naive(),
                distance: ride.distance_meters / 1000.0,
                description: Some(ride.name),
                strava_ride: Some(ride.id),
            };
            
            for bike_id in bike_ids {
                let existing = rides
                    .try_get_by_strava_ride_including_deleted(*bike_id, ride.id)
                    .await?;
                if existing.is_some() {
                    continue;
                }

                rides.create(*bike_id, &new).await?;
            }
        }

        filter.page += 1;
        strava_rides = api.get_activities(&filter).await?;
    }

    let link = StravaModel {
        last_sync: Utc::now().naive_utc(),
        ..link
    };
    repo.update(link).await?;

    Ok((StatusCode::CREATED, "{}".to_string()))
}

async fn update_link(
    Extension(session): Extension<SessionModel>,
    State(repo): State<StravaRepository>,
    Json(payload): Json<StravaLinkPartial>,
) -> AppResult<Json<StravaLink>> {
    let link = repo
        .try_get(session.user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Strava account not linked".to_string()))?;

    let link = StravaModel {
        last_sync: payload.last_sync,
        ..link
    };
    repo.update(link.clone()).await?;

    Ok(Json(StravaLink::from(link)))
}