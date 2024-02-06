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

pub trait RawRidesToModelsExt {
    fn to_models(self) -> Result<Vec<RideModel>, anyhow::Error>;
}

impl<T> RawRidesToModelsExt for T
where
    T: IntoIterator<Item = RideRaw>,
{
    fn to_models(self) -> Result<Vec<RideModel>, anyhow::Error> {
        self.into_iter().map(|x| x.try_into()).collect()
    }
}

pub trait RideModelsTotalExt {
    fn total_distance(self) -> f64;
}

impl<'a, T> RideModelsTotalExt for T
where
    T: Iterator<Item = &'a RideModel>,
{
    fn total_distance(self) -> f64 {
        self.map(|i| i.distance).sum()
    }
}

#[derive(Debug, Deserialize)]
pub struct RideCreate {
    pub date: NaiveDate,
    pub distance: f64,
    pub description: String,
}

#[derive(Debug, Deserialize)]
pub struct RideEdit {
    pub date: NaiveDate,
    pub distance: f64,
    pub description: String,
}
