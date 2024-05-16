use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{delete, get, post, put};
use axum::{Json, Router};

use crate::utility::error::AppResult;
use crate::utility::state::AppState;

use super::models::{BikeModel, BikePartial};
use super::repository::BikeRepository;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/bikes", get(get_all_bikes))
        .route("/bikes", post(create_bike))
        .route("/bike/:id", get(get_bike))
        .route("/bike/:id", put(update_bike))
        .route("/bike/:id", delete(delete_bike))
}

async fn get_all_bikes(State(repo): State<BikeRepository>) -> AppResult<Json<Vec<BikeModel>>> {
    let models = repo.get_all().await?;
    Ok(Json(models))
}

async fn create_bike(
    State(repo): State<BikeRepository>,
    Json(payload): Json<BikePartial>,
) -> AppResult<(StatusCode, Json<BikeModel>)> {
    let model = repo.create(&payload).await?;
    Ok((StatusCode::CREATED, Json(model)))
}

async fn get_bike(
    State(repo): State<BikeRepository>,
    Path(id): Path<i64>,
) -> AppResult<Json<BikeModel>> {
    repo.check_exists(id).await?;
    let model = repo.get_one(id).await?;
    Ok(Json(model))
}

async fn update_bike(
    State(repo): State<BikeRepository>,
    Path(id): Path<i64>,
    Json(payload): Json<BikePartial>,
) -> AppResult<Json<BikeModel>> {
    let model = repo.update(id, &payload).await?;
    Ok(Json(model))
}

async fn delete_bike(
    State(repo): State<BikeRepository>,
    Path(id): Path<i64>,
) -> AppResult<Json<()>> {
    repo.delete(id).await?;
    Ok(Json(()))
}
