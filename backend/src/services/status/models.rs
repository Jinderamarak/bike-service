use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Integration {
    Strava,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusModel {
    pub version: String,
    pub integrations: Vec<Integration>,
    pub hostnames: Vec<String>,
}
