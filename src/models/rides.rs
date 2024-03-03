use chrono::{NaiveDate, NaiveDateTime};
use serde::Deserialize;

pub const DATE_FORMAT: &str = "%Y-%m-%d";
pub const DELETED_AT_FORMAT: &str = "%Y-%m-%d %H:%M:%S";

#[derive(Debug, Clone)]
pub struct RideRaw {
    pub id: i64,
    pub date: String,
    pub distance: f64,
    pub description: Option<String>,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Clone)]
pub struct RideModel {
    pub id: i64,
    pub date: NaiveDate,
    pub distance: f64,
    pub description: Option<String>,
    pub deleted_at: Option<NaiveDateTime>,
}

impl TryFrom<RideRaw> for RideModel {
    type Error = anyhow::Error;
    fn try_from(raw: RideRaw) -> Result<Self, Self::Error> {
        let date = NaiveDate::parse_from_str(&raw.date, DATE_FORMAT)?;
        let deleted_at = match raw.deleted_at {
            Some(s) => Some(NaiveDateTime::parse_from_str(&s, DELETED_AT_FORMAT)?),
            None => None,
        };
        Ok(RideModel {
            id: raw.id,
            date,
            distance: raw.distance,
            description: raw.description,
            deleted_at,
        })
    }
}

impl From<RideModel> for RideRaw {
    fn from(model: RideModel) -> Self {
        RideRaw {
            id: model.id,
            date: model.date.format("%Y-%m-%d").to_string(),
            distance: model.distance,
            description: model.description,
            deleted_at: model
                .deleted_at
                .map(|dt| dt.format(DELETED_AT_FORMAT).to_string()),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct RideCreate {
    pub date: NaiveDate,
    pub distance: f64,
    pub description: String,
}

#[derive(Debug, Deserialize)]
pub struct RideUpdate {
    pub date: NaiveDate,
    pub distance: f64,
    pub description: String,
}
