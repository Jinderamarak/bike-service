use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{delete, get, post, put};
use axum::{Json, Router};

use crate::services::bikes::repository::BikeRepository;
use crate::utility::error::AppResult;
use crate::utility::state::AppState;

use super::models::{RideModel, RidePartial, RideTotal};
use super::repository::RideRepository;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/bikes/:id/rides", get(get_all_rides))
        .route("/bikes/:id/rides", post(create_ride))
        .route("/bikes/:id/rides/total", get(get_total))
        .route("/rides/:id", get(get_ride))
        .route("/rides/:id", put(update_ride))
        .route("/rides/:id", delete(delete_ride))
}

async fn get_all_rides(
    State(bikes): State<BikeRepository>,
    State(repo): State<RideRepository>,
    Path(bike_id): Path<i64>,
) -> AppResult<Json<Vec<RideModel>>> {
    bikes.check_exists(bike_id).await?;
    let models = repo.get_all_for_bike(bike_id).await?;
    Ok(Json(models))
}

async fn create_ride(
    State(bikes): State<BikeRepository>,
    State(repo): State<RideRepository>,
    Path(bike_id): Path<i64>,
    Json(payload): Json<RidePartial>,
) -> AppResult<(StatusCode, Json<RideModel>)> {
    bikes.check_exists(bike_id).await?;
    let model = repo.create(bike_id, &payload).await?;
    Ok((StatusCode::CREATED, Json(model)))
}

async fn get_total(
    State(repo): State<RideRepository>,
    Path(bike_id): Path<i64>,
) -> AppResult<Json<RideTotal>> {
    let total_distance = repo.total_distance_for_bike(bike_id).await?;
    let total = RideTotal { total_distance };
    Ok(Json(total))
}

async fn get_ride(
    State(repo): State<RideRepository>,
    Path(ride_id): Path<i64>,
) -> AppResult<Json<RideModel>> {
    repo.check_exists(ride_id).await?;
    let model = repo.get_one(ride_id).await?;
    Ok(Json(model))
}

async fn update_ride(
    State(repo): State<RideRepository>,
    Path(ride_id): Path<i64>,
    Json(payload): Json<RidePartial>,
) -> AppResult<Json<RideModel>> {
    let model = repo.update(ride_id, &payload).await?;
    Ok(Json(model))
}

async fn delete_ride(
    State(repo): State<RideRepository>,
    Path(ride_id): Path<i64>,
) -> AppResult<Json<()>> {
    repo.delete(ride_id).await?;
    Ok(Json(()))
}
