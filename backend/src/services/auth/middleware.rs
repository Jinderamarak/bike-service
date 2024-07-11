use axum::{
    extract::{Request, State},
    http::header,
    middleware::Next,
    response::Response,
};
use chrono::Utc;

use crate::{
    config::Configuration,
    services::users::repository::UserRepository,
    utility::error::{AppError, AppResult},
};

use super::repository::AuthRepository;

pub async fn auth_layer(
    State(user_repo): State<UserRepository>,
    State(auth_repo): State<AuthRepository>,
    State(config): State<Configuration>,
    mut req: Request,
    next: Next,
) -> AppResult<Response> {
    let header = req.headers().get(header::AUTHORIZATION);
    let token = if let Some(header) = header {
        header.to_str().map_err(|_| AppError::Unauthorized)?
    } else {
        return Err(AppError::Unauthorized);
    };

    let maybe_session = auth_repo.try_get_by_token(token).await?;
    let mut session = if let Some(session) = maybe_session {
        session
    } else {
        return Err(AppError::Unauthorized);
    };

    let now = Utc::now().naive_utc();
    let diff = now - session.last_used_at;
    if diff.num_seconds() > config.session_max_inactivity {
        return Err(AppError::Unauthorized);
    }

    if let Some(revoked) = session.revoked_at {
        if now > revoked {
            return Err(AppError::Unauthorized);
        }
    }

    auth_repo.update(&session.token, &now).await?;
    session.last_used_at = now;

    let user = user_repo.get_by_id(session.user_id).await?;

    req.extensions_mut().insert(user);
    req.extensions_mut().insert(session);
    Ok(next.run(req).await)
}
