use axum::{extract::State, routing::get, Json, Router};

use crate::{
    config::Configuration,
    utility::{error::AppResult, state::AppState},
    APP_VERSION,
};

use super::models::{Integration, StatusModel};

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(get_status))
}

async fn get_status(State(config): State<Configuration>) -> AppResult<Json<StatusModel>> {
    let mut integrations = Vec::new();
    if config.strava_config().is_some() {
        integrations.push(Integration::Strava);
    }

    Ok(Json(StatusModel {
        version: APP_VERSION.unwrap_or("unknown").to_string(),
        integrations,
        hostnames: config.hostnames,
    }))
}
