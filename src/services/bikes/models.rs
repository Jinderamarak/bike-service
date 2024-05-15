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
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BikeModel {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub deleted_at: Option<NaiveDateTime>,
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
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct BikePartial {
    pub name: String,
    pub description: Option<String>,
}
