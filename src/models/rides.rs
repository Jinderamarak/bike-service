use chrono::NaiveDate;
use serde::Deserialize;

#[derive(Debug, Clone)]
pub struct RideRaw {
    pub id: i64,
    pub date: String,
    pub distance: f64,
    pub description: Option<String>,
}

#[derive(Debug, Clone)]
pub struct RideModel {
    pub id: i64,
    pub date: NaiveDate,
    pub distance: f64,
    pub description: Option<String>,
}

impl TryFrom<RideRaw> for RideModel {
    type Error = anyhow::Error;
    fn try_from(raw: RideRaw) -> Result<Self, Self::Error> {
        let date = NaiveDate::parse_from_str(&raw.date, "%Y-%m-%d")?;
        Ok(RideModel {
            id: raw.id,
            date,
            distance: raw.distance,
            description: raw.description,
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
