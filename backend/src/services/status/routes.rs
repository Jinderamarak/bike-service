use axum::{extract::State, routing::get, Json, Router};

use crate::{
    config::Configuration,
    utility::{error::AppResult, state::AppState},
    APP_VERSION,
};

use super::models::StatusModel;

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(get_status))
}

async fn get_status(State(config): State<Configuration>) -> AppResult<Json<StatusModel>> {
    Ok(Json(StatusModel {
        version: APP_VERSION.unwrap_or("unknown").to_string(),
        hostnames: config.hostnames,
    }))
}
