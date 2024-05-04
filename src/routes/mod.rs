use axum::routing::get;
use axum::Router;

use crate::utility::state::AppState;

mod data;
mod rides;
mod root;

pub fn main_router() -> Router<AppState> {
    Router::new()
        .route("/", get(root::get_root))
        .nest("/ride", rides::mileage_router())
        .nest("/data", data::data_router())
}
