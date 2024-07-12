use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

use crate::utility::{
    db_extensions::Model,
    db_format::{format_date_time, parse_date_time},
};

#[derive(Debug, Clone)]
pub struct BikeRaw {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub deleted_at: Option<String>,
    pub color: Option<String>,
    pub owner_id: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BikeModel {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub deleted_at: Option<NaiveDateTime>,
    pub color: Option<String>,
    pub owner_id: i64,
}

impl Model<BikeRaw> for BikeModel {}

impl TryFrom<BikeRaw> for BikeModel {
    type Error = anyhow::Error;
    fn try_from(raw: BikeRaw) -> Result<Self, Self::Error> {
        let deleted_at = raw.deleted_at.map(|s| parse_date_time(&s)).transpose()?;
        Ok(BikeModel {
            id: raw.id,
            name: raw.name,
            description: raw.description,
            deleted_at,
            color: raw.color,
            owner_id: raw.owner_id,
        })
    }
}

impl From<BikeModel> for BikeRaw {
    fn from(model: BikeModel) -> Self {
        let deleted_at = model.deleted_at.map(|dt| format_date_time(&dt));
        BikeRaw {
            id: model.id,
            name: model.name,
            description: model.description,
            deleted_at,
            color: model.color,
            owner_id: model.owner_id,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BikePartial {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
}
