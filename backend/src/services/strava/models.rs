use chrono::NaiveDateTime;
use serde::Serialize;

use crate::utility::{
    db_extensions::Model,
    db_format::{format_date_time, parse_date_time},
};

#[derive(Debug, Clone)]
pub struct StravaRaw {
    pub user_id: i64,
    pub strava_id: i64,
    pub strava_name: String,
    pub last_sync: String,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StravaModel {
    pub user_id: i64,
    pub strava_id: i64,
    pub strava_name: String,
    pub last_sync: NaiveDateTime,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: NaiveDateTime,
}

impl Model<StravaRaw> for StravaModel {}

impl TryFrom<StravaRaw> for StravaModel {
    type Error = anyhow::Error;
    fn try_from(raw: StravaRaw) -> Result<Self, Self::Error> {
        let last_sync = parse_date_time(&raw.last_sync)?;
        let expires_at = parse_date_time(&raw.expires_at)?;
        Ok(StravaModel {
            user_id: raw.user_id,
            strava_id: raw.strava_id,
            strava_name: raw.strava_name,
            last_sync,
            access_token: raw.access_token,
            refresh_token: raw.refresh_token,
            expires_at,
        })
    }
}

impl From<StravaModel> for StravaRaw {
    fn from(model: StravaModel) -> Self {
        let last_sync = format_date_time(&model.last_sync);
        let expires_at = format_date_time(&model.expires_at);
        StravaRaw {
            user_id: model.user_id,
            strava_id: model.strava_id,
            strava_name: model.strava_name,
            last_sync,
            access_token: model.access_token,
            refresh_token: model.refresh_token,
            expires_at,
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StravaLink {
    pub user_id: i64,
    pub strava_id: i64,
    pub strava_name: String,
}

impl From<StravaModel> for StravaLink {
    fn from(model: StravaModel) -> Self {
        StravaLink {
            user_id: model.user_id,
            strava_id: model.strava_id,
            strava_name: model.strava_name,
        }
    }
}

#[derive(Serialize)]
pub struct OAuthUrl {
    pub url: String,
}