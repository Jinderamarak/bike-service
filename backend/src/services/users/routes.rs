use axum::extract::State;
use axum::http::StatusCode;
use axum::routing::{delete, post};
use axum::{Extension, Json, Router};

use crate::services::auth::models::SessionModel;
use crate::utility::error::{AppError, AppResult};
use crate::utility::state::AppState;

use super::models::{UserModel, UserPartial};
use super::repository::UserRepository;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(create_user))
        .route("/", delete(delete_user))
}

async fn create_user(
    State(repo): State<UserRepository>,
    Json(payload): Json<UserPartial>,
) -> AppResult<(StatusCode, Json<UserModel>)> {
    let user = repo.get_by_username(&payload.username).await;
    if user.is_ok() {
        return Err(AppError::Conflict("Username already exists".to_string()));
    }

    let model = repo.create(&payload).await?;
    Ok((StatusCode::CREATED, Json(model)))
}

async fn delete_user(
    State(repo): State<UserRepository>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<StatusCode> {
    repo.delete(session.user_id).await?;
    Ok(StatusCode::NO_CONTENT)
}
