use chrono::NaiveDateTime;
use reqwest::Client;

use crate::{config::StravaConfig, services::strava::models::StravaModel};

use super::auth::StravaApiWithAuth;
use super::models::{IssueTokenResponse, RefreshTokenResponse};
use super::STRAVA_API_URL;

#[derive(Clone)]
pub struct StravaApiNoAuth {
    config: StravaConfig,
    client: Client,
}

impl StravaApiNoAuth {
    pub fn new(config: StravaConfig) -> StravaApiNoAuth {
        Self {
            config,
            client: Client::new(),
        }
    }

    pub fn with_auth(self, link: &StravaModel) -> anyhow::Result<StravaApiWithAuth> {
        StravaApiWithAuth::new(link)
    }

    pub async fn issue_token(
        &self,
        code: impl ToString,
        user_id: impl Into<i64>,
    ) -> anyhow::Result<StravaModel> {
        let path = format!("{STRAVA_API_URL}/oauth/token");
        let response = self
            .client
            .post(&path)
            .query(&[
                ("client_id", self.config.client_id.clone()),
                ("client_secret", self.config.client_secret.clone()),
                ("code", code.to_string()),
                ("grant_type", "authorization_code".to_string()),
            ])
            .send()
            .await?
            .json::<IssueTokenResponse>()
            .await?;

        let expires_at = NaiveDateTime::from_timestamp_opt(response.expires_at, 0).unwrap();
        Ok(StravaModel {
            user_id: user_id.into(),
            strava_id: response.athlete.id,
            strava_name: format!(
                "{} {}",
                response.athlete.firstname, response.athlete.lastname
            ),
            last_sync: NaiveDateTime::from_timestamp_opt(0, 0).unwrap(),
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            expires_at,
        })
    }

    pub async fn refresh_token(&self, model: StravaModel) -> anyhow::Result<StravaModel> {
        let path = format!("{STRAVA_API_URL}/oauth/token");
        let response = self
            .client
            .post(&path)
            .query(&[
                ("client_id", &self.config.client_id),
                ("client_secret", &self.config.client_secret),
                ("refresh_token", &model.refresh_token),
                ("grant_type", &"refresh_token".to_string()),
            ])
            .send()
            .await?
            .json::<RefreshTokenResponse>()
            .await?;

        let expires_at = NaiveDateTime::from_timestamp_opt(response.expires_at, 0).unwrap();
        Ok(StravaModel {
            user_id: model.user_id,
            strava_id: model.strava_id,
            strava_name: model.strava_name,
            last_sync: model.last_sync,
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            expires_at,
        })
    }
}
