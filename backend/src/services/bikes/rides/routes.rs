use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{delete, get, post, put};
use axum::{Extension, Json, Router};
use chrono::Datelike;

use crate::services::auth::models::SessionModel;
use crate::services::bikes::repository::BikeRepository;
use crate::utility::error::AppResult;
use crate::utility::state::AppState;

use super::models::{RideModel, RideMonth, RidePartial};
use super::repository::RideRepository;

pub fn router_with_auth() -> Router<AppState> {
    Router::new()
        .route("/", get(get_all_rides))
        .route("/", post(create_ride))
        .route("/years", get(get_active_years))
        .route("/monthly/:year", get(get_monthly_rides))
        .route("/:year/:month", get(get_month))
        .route("/:id", get(get_ride))
        .route("/:id", put(update_ride))
        .route("/:id", delete(delete_ride))
}

async fn get_all_rides(
    State(bike_repo): State<BikeRepository>,
    State(ride_repo): State<RideRepository>,
    Path(bike_id): Path<i64>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<Json<Vec<RideModel>>> {
    bike_repo.assert_owner(bike_id, session.user_id).await?;

    let models = ride_repo.get_all_for_bike(bike_id).await?;
    Ok(Json(models))
}

async fn create_ride(
    State(bike_repo): State<BikeRepository>,
    State(ride_repo): State<RideRepository>,
    Path(bike_id): Path<i64>,
    Extension(session): Extension<SessionModel>,
    Json(payload): Json<RidePartial>,
) -> AppResult<(StatusCode, Json<RideModel>)> {
    bike_repo.assert_owner(bike_id, session.user_id).await?;

    let model = ride_repo.create(bike_id, &payload).await?;
    Ok((StatusCode::CREATED, Json(model)))
}

async fn get_ride(
    State(bike_repo): State<BikeRepository>,
    State(ride_repo): State<RideRepository>,
    Path((bike_id, ride_id)): Path<(i64, i64)>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<Json<RideModel>> {
    bike_repo.assert_owner(bike_id, session.user_id).await?;

    let model = ride_repo.get_one(ride_id).await?;
    Ok(Json(model))
}

async fn update_ride(
    State(bike_repo): State<BikeRepository>,
    State(ride_repo): State<RideRepository>,
    Path((bike_id, ride_id)): Path<(i64, i64)>,
    Extension(session): Extension<SessionModel>,
    Json(payload): Json<RidePartial>,
) -> AppResult<Json<RideModel>> {
    bike_repo.assert_owner(bike_id, session.user_id).await?;

    let model = ride_repo.update(ride_id, &payload).await?;
    Ok(Json(model))
}

async fn delete_ride(
    State(bike_repo): State<BikeRepository>,
    State(ride_repo): State<RideRepository>,
    Path((bike_id, ride_id)): Path<(i64, i64)>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<StatusCode> {
    bike_repo.assert_owner(bike_id, session.user_id).await?;

    ride_repo.delete(ride_id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn get_active_years(
    State(bike_repo): State<BikeRepository>,
    State(ride_repo): State<RideRepository>,
    Path(bike_id): Path<i64>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<Json<Vec<i32>>> {
    bike_repo.assert_owner(bike_id, session.user_id).await?;

    let years = ride_repo.active_years(bike_id).await?;
    Ok(Json(years))
}

async fn get_monthly_rides(
    State(bike_repo): State<BikeRepository>,
    State(ride_repo): State<RideRepository>,
    Path((bike_id, year)): Path<(i64, i32)>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<Json<Vec<RideMonth>>> {
    bike_repo.assert_owner(bike_id, session.user_id).await?;

    let mut result = Vec::with_capacity(12);
    for month in 0..12 {
        let month = RideMonth {
            year,
            month: 12 - month,
            total_distance: 0.0,
            rides: Vec::new(),
        };
        result.push(month);
    }

    let filter = format!("{year}-");
    let models = ride_repo
        .get_all_for_bike_with_date(bike_id, &filter)
        .await?;
    for model in models {
        let month = model.date.month() as usize;
        result[12 - month].total_distance += model.distance;
        result[12 - month].rides.push(model);
    }

    Ok(Json(result))
}

async fn get_month(
    State(bike_repo): State<BikeRepository>,
    State(ride_repo): State<RideRepository>,
    Path((bike_id, year, month)): Path<(i64, i32, i32)>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<Json<RideMonth>> {
    bike_repo.assert_owner(bike_id, session.user_id).await?;

    let filter = format!("{year}-{month:02}-");
    let models = ride_repo
        .get_all_for_bike_with_date(bike_id, &filter)
        .await?;
    let total_distance = models.iter().map(|m| m.distance).sum();

    Ok(Json(RideMonth {
        year,
        month,
        total_distance,
        rides: models,
    }))
}
