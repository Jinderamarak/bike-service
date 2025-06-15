use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{delete, get, post, put};
use axum::{Extension, Json, Router};

use crate::services::auth::models::SessionModel;
use crate::utility::error::AppResult;
use crate::utility::state::AppState;

use super::models::{BikeModel, BikePartial};
use super::repository::BikeRepository;
use super::rides;

pub fn router_with_auth() -> Router<AppState> {
    Router::new()
        .nest("/{id}/rides", rides::routes::router_with_auth())
        .route("/", get(get_all_bikes))
        .route("/", post(create_bike))
        .route("/{id}", get(get_bike))
        .route("/{id}", put(update_bike))
        .route("/{id}", delete(delete_bike))
}

async fn get_all_bikes(
    State(repo): State<BikeRepository>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<Json<Vec<BikeModel>>> {
    let models = repo.get_all(session.user_id).await?;
    Ok(Json(models))
}

async fn create_bike(
    State(bike_repo): State<BikeRepository>,
    Extension(session): Extension<SessionModel>,
    Json(payload): Json<BikePartial>,
) -> AppResult<(StatusCode, Json<BikeModel>)> {
    let model = bike_repo.create(session.user_id, &payload).await?;
    Ok((StatusCode::CREATED, Json(model)))
}

async fn get_bike(
    State(bike_repo): State<BikeRepository>,
    Path(id): Path<i64>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<Json<BikeModel>> {
    bike_repo.assert_owner(id, session.user_id).await?;

    let model = bike_repo.get_one(id).await?;
    Ok(Json(model))
}

async fn update_bike(
    State(bike_repo): State<BikeRepository>,
    Path(id): Path<i64>,
    Extension(session): Extension<SessionModel>,
    Json(payload): Json<BikePartial>,
) -> AppResult<Json<BikeModel>> {
    bike_repo.assert_owner(id, session.user_id).await?;

    let model = bike_repo.update(id, session.user_id, &payload).await?;
    Ok(Json(model))
}

async fn delete_bike(
    State(bike_repo): State<BikeRepository>,
    Path(id): Path<i64>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<StatusCode> {
    bike_repo.assert_owner(id, session.user_id).await?;

    bike_repo.delete(id).await?;
    Ok(StatusCode::NO_CONTENT)
}
