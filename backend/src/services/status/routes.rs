use axum::{debug_handler, routing::get, Json, Router};

use crate::{
    utility::{error::AppResult, state::AppState},
    APP_VERSION,
};

use super::models::StatusModel;

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(get_status))
}

#[debug_handler]
async fn get_status() -> AppResult<Json<StatusModel>> {
    Ok(Json(StatusModel {
        version: APP_VERSION.unwrap_or("unknown").to_string(),
        hosts: vec![],
    }))
}
