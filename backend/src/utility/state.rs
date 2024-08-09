use axum::extract::FromRef;
use sqlx::SqlitePool;

use crate::{
    config::Configuration,
    services::{
        auth::repository::AuthRepository,
        bikes::{repository::BikeRepository, rides::repository::RideRepository},
        strava::{api::no_auth::StravaApiNoAuth, repository::StravaRepository},
        users::repository::UserRepository,
    },
};

#[derive(Clone)]
pub struct AppState {
    config: Configuration,
    pool: SqlitePool,
    rides: RideRepository,
    bikes: BikeRepository,
    users: UserRepository,
    auth: AuthRepository,
    strava: StravaRepository,
    strava_api: Option<StravaApiNoAuth>,
}

impl AppState {
    pub fn new(config: Configuration, pool: SqlitePool) -> Self {
        let rides = RideRepository::new(pool.clone());
        let bikes = BikeRepository::new(pool.clone());
        let users = UserRepository::new(pool.clone());
        let auth = AuthRepository::new(pool.clone());
        let strava = StravaRepository::new(pool.clone());
        let strava_api = config.strava_config().map(StravaApiNoAuth::new);
        Self {
            config,
            pool,
            rides,
            bikes,
            users,
            auth,
            strava,
            strava_api,
        }
    }
}

impl FromRef<AppState> for Configuration {
    fn from_ref(state: &AppState) -> Self {
        state.config.clone()
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

impl FromRef<AppState> for UserRepository {
    fn from_ref(state: &AppState) -> Self {
        state.users.clone()
    }
}

impl FromRef<AppState> for AuthRepository {
    fn from_ref(state: &AppState) -> Self {
        state.auth.clone()
    }
}

impl FromRef<AppState> for StravaRepository {
    fn from_ref(state: &AppState) -> Self {
        state.strava.clone()
    }
}

impl FromRef<AppState> for Option<StravaApiNoAuth> {
    fn from_ref(state: &AppState) -> Self {
        state.strava_api.clone()
    }
}
