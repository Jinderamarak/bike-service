use axum::routing::get;
use axum::Router;

use crate::utility::state::AppState;

mod data;
mod rides;
mod root;
mod stats;

pub fn main_router() -> Router<AppState> {
    Router::new()
        .route("/", get(root::get_root))
        .nest("/ride", rides::rides_router())
        .nest("/stats", stats::stats_router())
        .nest("/data", data::data_router())
}
