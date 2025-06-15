use axum::{
    extract::{FromRequestParts, State},
    http::request::Parts,
    response::{IntoResponse, Response},
    RequestPartsExt,
};

use crate::{
    config::{Configuration, StravaConfig},
    utility::state::AppState,
};

use super::api::no_auth::StravaApiNoAuth;

pub struct Strava(pub StravaConfig, pub StravaApiNoAuth);

impl FromRequestParts<AppState> for Strava {
    type Rejection = Response;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let config = parts
            .extract_with_state::<State<Configuration>, AppState>(state)
            .await
            .map_err(|e| e.into_response())?
            .strava_config();

        let State(api) = parts
            .extract_with_state::<State<Option<StravaApiNoAuth>>, AppState>(state)
            .await
            .map_err(|e| e.into_response())?;

        match (config, api) {
            (Some(config), Some(api)) => Ok(Self(config, api)),
            _ => Err(String::from("Strava integration not configured").into_response()),
        }
    }
}
