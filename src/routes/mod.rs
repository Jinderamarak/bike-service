use axum::Router;
use sqlx::SqlitePool;

mod rides;
mod root;

pub fn main_router() -> Router<SqlitePool> {
    Router::new()
        .nest("/", root::root_router())
        .nest("/ride", rides::mileage_router())
}
