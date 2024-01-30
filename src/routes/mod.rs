use axum::Router;
use sqlx::SqlitePool;

mod mileage;
mod root;

pub fn main_router() -> Router<SqlitePool> {
    Router::new()
        .nest("/", root::root_router())
        .nest("/mileage", mileage::mileage_router())
}
