use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct SummaryAthlete {
    pub id: i64,
    pub firstname: String,
    pub lastname: String,
}

#[derive(Deserialize)]
pub struct DetailedAthlete {
    pub id: i64,
    pub firstname: String,
    pub lastname: String,
    pub bikes: Vec<SummaryGear>,
}

#[derive(Deserialize, Serialize)]
pub struct SummaryGear {
    pub id: String,
    pub name: String,
}

#[derive(Deserialize)]
pub struct IssueTokenResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: i64,
    pub athlete: SummaryAthlete,
}

#[derive(Deserialize)]
pub struct RefreshTokenResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: i64,
}

#[derive(Deserialize)]
pub struct ActivityFilter {
    pub before: Option<NaiveDateTime>,
    pub after: Option<NaiveDateTime>,
    pub page: i64,
    pub per_page: i64,
}

impl Default for ActivityFilter {
    fn default() -> Self {
        Self {
            before: None,
            after: None,
            page: 1,
            per_page: 30,
        }
    }
}

#[derive(Deserialize)]
#[serde(from = "String")]
pub enum SportType {
    BikeRide,
    Other,
}

impl From<String> for SportType {
    fn from(s: String) -> Self {
        match s.as_str() {
            "EBikeRide" | "EMountainBikeRide" | "GravelRide" | "Handcycle" | "MountainBikeRide"
            | "Ride" | "Velomobile" | "VirtualRide" => SportType::BikeRide,
            _ => SportType::Other,
        }
    }
}

#[derive(Deserialize)]
pub struct SummaryActivity {
    pub id: i64,
    pub name: String,
    #[serde(rename = "distance")]
    pub distance_meters: f64,
    pub sport_type: SportType,
    pub start_date_local: DateTime<Utc>,
    pub gear_id: Option<String>,
}
