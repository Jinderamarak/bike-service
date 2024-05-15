use axum::Router;

use crate::utility::state::AppState;

pub mod bikes;
pub mod data;
pub mod rides;

pub fn api_router() -> Router<AppState> {
    Router::new()
        .nest("/", bikes::routes::router())
        .nest("/", rides::routes::router())
        .nest("/", data::routes::router())
}
