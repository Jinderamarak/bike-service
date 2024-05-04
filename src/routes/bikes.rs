use axum::Router;

use crate::utility::state::AppState;

pub fn bikes_router() -> Router<AppState> {
    Router::new().route("/", post(create_ride))
}
