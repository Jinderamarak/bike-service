use reqwest::{header, Client};

use crate::{config::StravaConfig, services::strava::models::StravaModel};

use super::{
    models::{ActivityFilter, DetailedAthlete, SummaryActivity},
    STRAVA_API_URL,
};

pub struct StravaApiWithAuth {
    config: StravaConfig,
    client: Client,
}

impl StravaApiWithAuth {
    pub fn new(config: StravaConfig, link: &StravaModel) -> anyhow::Result<StravaApiWithAuth> {
        let mut headers = header::HeaderMap::new();
        let mut auth = header::HeaderValue::try_from(format!("Bearer {}", link.access_token))?;
        auth.set_sensitive(true);
        headers.insert(header::AUTHORIZATION, auth);

        Ok(Self {
            config,
            client: Client::builder().default_headers(headers).build()?,
        })
    }

    pub async fn get_athlete(&self) -> anyhow::Result<DetailedAthlete> {
        let path = format!("{STRAVA_API_URL}/athlete");
        let response = self
            .client
            .get(&path)
            .send()
            .await?
            .json::<DetailedAthlete>()
            .await?;

        Ok(response)
    }

    pub async fn get_activities(
        &self,
        filter: ActivityFilter,
    ) -> anyhow::Result<Vec<SummaryActivity>> {
        let path = format!("{STRAVA_API_URL}/athlete/activities");
        let response = self
            .client
            .get(&path)
            .query(&("before", filter.before))
            .query(&("after", filter.after))
            .query(&("page", filter.page))
            .query(&("per_page", filter.per_page))
            .send()
            .await?
            .json::<Vec<SummaryActivity>>()
            .await?;

        Ok(response)
    }
}
