use axum::extract::State;
use axum::http::StatusCode;
use axum::routing::{delete, get, post, put};
use axum::{Extension, Json, Router};

use crate::services::auth::models::SessionModel;
use crate::utility::error::{AppError, AppResult};
use crate::utility::state::AppState;

use super::models::{UserModel, UserPartial};
use super::repository::UserRepository;

pub fn router() -> Router<AppState> {
    Router::new().route("/", post(create_user))
}

pub fn router_with_auth() -> Router<AppState> {
    Router::new()
        .route("/", get(current_user))
        .route("/", put(update_user))
        .route("/", delete(delete_user))
}

async fn create_user(
    State(repo): State<UserRepository>,
    Json(payload): Json<UserPartial>,
) -> AppResult<(StatusCode, Json<UserModel>)> {
    let user = repo.try_get_by_username(&payload.username).await?;
    if user.is_some() {
        return Err(AppError::Conflict("Username already exists".to_string()));
    }

    let model = repo.create(&payload).await?;
    Ok((StatusCode::CREATED, Json(model)))
}

async fn current_user(Extension(user): Extension<UserModel>) -> AppResult<Json<UserModel>> {
    Ok(Json(user))
}

async fn update_user(
    State(user_repo): State<UserRepository>,
    Extension(user): Extension<UserModel>,
    Json(update): Json<UserPartial>,
) -> AppResult<Json<UserModel>> {
    let model = user_repo.update(user.id, &update).await?;
    Ok(Json(model))
}

async fn delete_user(
    State(repo): State<UserRepository>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<StatusCode> {
    repo.delete(session.user_id).await?;
    Ok(StatusCode::NO_CONTENT)
}
