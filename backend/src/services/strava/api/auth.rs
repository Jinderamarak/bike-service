use reqwest::{header, Client};

use crate::services::strava::models::StravaModel;

use super::{
    models::{ActivityFilter, DetailedAthlete, SummaryActivity},
    STRAVA_API_URL,
};

pub struct StravaApiWithAuth {
    client: Client,
}

impl StravaApiWithAuth {
    pub fn new(link: &StravaModel) -> anyhow::Result<StravaApiWithAuth> {
        let mut headers = header::HeaderMap::new();
        let mut auth = header::HeaderValue::try_from(format!("Bearer {}", link.access_token))?;
        auth.set_sensitive(true);
        headers.insert(header::AUTHORIZATION, auth);

        Ok(Self {
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
        filter: &ActivityFilter,
    ) -> anyhow::Result<Vec<SummaryActivity>> {
        let query = [
            ("before", filter.before.map(|x| x.timestamp().to_string())),
            ("after", filter.after.map(|x| x.timestamp().to_string())),
            ("page", Some(filter.page.to_string())),
            ("per_page", Some(filter.per_page.to_string())),
        ]
        .into_iter()
        .filter_map(|(k, v)| v.map(|v| (k, v)))
        .collect::<Vec<_>>();

        let path = format!("{STRAVA_API_URL}/athlete/activities");
        let response = self
            .client
            .get(&path)
            .query(&query)
            .send()
            .await?
            .json::<Vec<SummaryActivity>>()
            .await?;

        Ok(response)
    }
}
