use axum::Router;

use crate::utility::state::AppState;

pub mod bikes;
pub mod data;

pub fn api_router() -> Router<AppState> {
    Router::new()
        .nest("/bikes", bikes::routes::router())
        .nest("/data", data::routes::router())
}
