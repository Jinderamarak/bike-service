use std::{collections::HashMap, sync::LazyLock};

use anyhow::anyhow;
use axum::{
    extract::{Query, State},
    http::HeaderMap,
    routing::get,
    Extension, Router,
};
use chrono::{NaiveDateTime, Utc};
use reqwest::StatusCode;
use serde::Deserialize;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::{
    services::auth::models::SessionModel,
    utility::{
        error::{AppError, AppResult},
        state::AppState,
    },
};

use super::{extractor::Strava, repository::StravaRepository};

const SCOPES: &[&str] = &["read_all", "activity:read_all"];
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
    Router::new().route("/oauth", get(oauth))
}

async fn oauth(
    Strava(config, _): Strava,
    Extension(session): Extension<SessionModel>,
) -> AppResult<(StatusCode, HeaderMap)> {
    let state = Uuid::new_v4();
    let scope = SCOPES.join(",");
    let oauth = config.oauth_url("/api/strava/redirect", scope, state.to_string());

    let user_id = session.user_id;
    let now = Utc::now().naive_utc();

    clear_states().await;
    let states = &(*STATES);
    let mut states = states.lock().await;
    states.insert(state, (user_id, now));

    let mut headers = HeaderMap::new();
    headers.insert("Location", oauth.parse().unwrap());

    Ok((StatusCode::TEMPORARY_REDIRECT, headers))
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
    headers.insert("Location", "/integrate/strava".parse().unwrap());

    Ok((StatusCode::TEMPORARY_REDIRECT, headers))
}
