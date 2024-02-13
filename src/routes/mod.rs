use axum::routing::get;
use axum::Router;

use crate::state::AppState;

mod rides;
mod root;

pub fn main_router() -> Router<AppState> {
    Router::new()
        .route("/", get(root::get_root))
        .nest("/ride", rides::mileage_router())
}
