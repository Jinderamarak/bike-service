use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::routing::{delete, get, post};
use axum::{Extension, Json, Router};
use chrono::Utc;

use crate::services::users::models::{UserLogin, UserModel};
use crate::services::users::repository::UserRepository;
use crate::utility::error::{AppError, AppResult};
use crate::utility::state::AppState;

use super::models::SessionModel;
use super::repository::AuthRepository;
use super::session::create_session;

pub fn router() -> Router<AppState> {
    Router::new().route("/", post(login))
}

pub fn router_with_auth() -> Router<AppState> {
    Router::new()
        .route("/", get(whoami))
        .route("/", delete(logout))
        .route("/{id}", delete(revoke))
}

async fn whoami(
    Extension(user): Extension<UserModel>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<Json<(UserModel, SessionModel)>> {
    Ok(Json((user, session)))
}

async fn login(
    State(auth_repo): State<AuthRepository>,
    State(user_repo): State<UserRepository>,
    headers: HeaderMap,
    Json(user): Json<UserLogin>,
) -> AppResult<Json<SessionModel>> {
    let user = user_repo.try_get_by_username(&user.username).await?;
    let user = user.ok_or(AppError::NotFound("User not found".to_string()))?;

    let session = create_session(user.id, &headers);
    auth_repo.create(&session).await?;

    Ok(Json(session))
}

async fn logout(
    State(auth_repo): State<AuthRepository>,
    Extension(session): Extension<SessionModel>,
) -> AppResult<StatusCode> {
    let now = Utc::now().naive_utc();
    auth_repo
        .revoke(session.user_id, &session.id.to_string(), &now)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn revoke(
    State(auth_repo): State<AuthRepository>,
    Extension(session): Extension<SessionModel>,
    Path(session_id): Path<String>,
) -> AppResult<StatusCode> {
    let now = Utc::now().naive_utc();
    auth_repo.revoke(session.user_id, &session_id, &now).await?;
    Ok(StatusCode::NO_CONTENT)
}
