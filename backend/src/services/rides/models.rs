use chrono::{NaiveDate, NaiveDateTime};
use serde::{Deserialize, Serialize};

use crate::utility::{
    db_extensions::Model,
    db_format::{format_date, format_date_time, parse_date, parse_date_time},
};

#[derive(Debug, Clone)]
pub struct RideRaw {
    pub id: i64,
    pub date: String,
    pub distance: f64,
    pub description: Option<String>,
    pub deleted_at: Option<String>,
    pub bike_id: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RideModel {
    pub id: i64,
    pub date: NaiveDate,
    pub distance: f64,
    pub description: Option<String>,
    pub deleted_at: Option<NaiveDateTime>,
    pub bike_id: i64,
}

impl Model<RideRaw> for RideModel {}

impl TryFrom<RideRaw> for RideModel {
    type Error = anyhow::Error;
    fn try_from(raw: RideRaw) -> Result<Self, Self::Error> {
        let date = parse_date(&raw.date)?;
        let deleted_at = raw.deleted_at.map(|s| parse_date_time(&s)).transpose()?;
        Ok(RideModel {
            id: raw.id,
            date,
            distance: raw.distance,
            description: raw.description,
            deleted_at,
            bike_id: raw.bike_id,
        })
    }
}

impl From<RideModel> for RideRaw {
    fn from(model: RideModel) -> Self {
        let date = format_date(&model.date);
        let deleted_at = model.deleted_at.map(|dt| format_date_time(&dt));
        RideRaw {
            id: model.id,
            date,
            distance: model.distance,
            description: model.description,
            deleted_at,
            bike_id: model.bike_id,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RidePartial {
    pub date: NaiveDate,
    pub distance: f64,
    pub description: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RideTotal {
    pub total_distance: f64,
}
