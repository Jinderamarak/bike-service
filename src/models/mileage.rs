use chrono::{NaiveDate, ParseError};
use serde::Deserialize;

#[derive(Debug, Clone)]
pub struct MileageRaw {
    pub id: i64,
    pub date: String,
    pub distance: f64,
}

#[derive(Debug, Clone)]
pub struct MileageModel {
    pub id: i64,
    pub date: NaiveDate,
    pub distance: f64,
}

impl TryFrom<MileageRaw> for MileageModel {
    type Error = ParseError;
    fn try_from(raw: MileageRaw) -> Result<Self, Self::Error> {
        let date = NaiveDate::parse_from_str(&raw.date, "%Y-%m-%d")?;
        Ok(MileageModel {
            id: raw.id,
            date,
            distance: raw.distance,
        })
    }
}

impl From<MileageModel> for MileageRaw {
    fn from(model: MileageModel) -> Self {
        MileageRaw {
            id: model.id,
            date: model.date.format("%Y-%m-%d").to_string(),
            distance: model.distance,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct MileageCreate {
    pub distance: f64,
}