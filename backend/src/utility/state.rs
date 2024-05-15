use axum::extract::FromRef;
use sqlx::SqlitePool;

use crate::services::{bikes::repository::BikeRepository, rides::repository::RideRepository};

#[derive(Clone)]
pub struct AppState {
    pool: SqlitePool,
    rides: RideRepository,
    bikes: BikeRepository,
}

impl AppState {
    pub fn new(pool: SqlitePool) -> Self {
        let rides = RideRepository::new(pool.clone());
        let bikes = BikeRepository::new(pool.clone());
        Self { pool, rides, bikes }
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

impl FromRef<AppState> for BikeRepository {
    fn from_ref(state: &AppState) -> Self {
        state.bikes.clone()
    }
}
