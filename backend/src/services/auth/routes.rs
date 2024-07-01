use axum::extract::State;
use axum::http::HeaderMap;
use axum::routing::{get, post};
use axum::{Extension, Json, Router};

use crate::services::users::models::{UserLogin, UserModel};
use crate::services::users::repository::UserRepository;
use crate::utility::error::AppResult;
use crate::utility::state::AppState;

use super::models::SessionModel;
use super::repository::AuthRepository;
use super::session::create_session;

pub fn router() -> Router<AppState> {
    Router::new().route("/", post(login))
}

pub fn router_with_auth() -> Router<AppState> {
    Router::new().route("/", get(whoami))
}

async fn whoami(
    Extension(user): Extension<UserModel>,
    //Extension(session): Extension<SessionModel>,
) -> AppResult<Json<UserModel>> {
    Ok(Json(user))
}

async fn login(
    State(auth_repo): State<AuthRepository>,
    State(user_repo): State<UserRepository>,
    headers: HeaderMap,
    Json(user): Json<UserLogin>,
) -> AppResult<Json<SessionModel>> {
    let user = user_repo.get_by_username(&user.username).await?;

    let session = create_session(user.id, &headers);
    auth_repo.create(&session).await?;

    Ok(Json(session))
}
