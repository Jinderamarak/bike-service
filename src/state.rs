use crate::repositories::rides::RideRepository;
use axum::extract::FromRef;
use sqlx::SqlitePool;

#[derive(Clone)]
pub struct AppState {
    pool: SqlitePool,
    rides: RideRepository,
}

impl AppState {
    pub fn new(pool: SqlitePool) -> Self {
        let rides = RideRepository::new(pool.clone());
        Self { pool, rides }
    }
}

impl FromRef<AppState> for SqlitePool {
    fn from_ref(state: &AppState) -> Self {
        state.pool.clone()
    }
}

impl FromRef<AppState> for RideRepository {
    fn from_ref(state: &AppState) -> Self {
        state.rides.clone()
    }
}
