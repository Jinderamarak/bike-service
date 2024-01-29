use chrono::NaiveDate;
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
    type Error = anyhow::Error;
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

pub trait MileageRawToModelsExt {
    fn to_models(self) -> Result<Vec<MileageModel>, anyhow::Error>;
}

impl<T> MileageRawToModelsExt for T
where
    T: IntoIterator<Item = MileageRaw>,
{
    fn to_models(self) -> Result<Vec<MileageModel>, anyhow::Error> {
        self.into_iter().map(|x| x.try_into()).collect()
    }
}

pub trait MileageModelsTotalExt {
    fn total_mileage(self) -> f64;
}

impl<'a, T> MileageModelsTotalExt for T
where
    T: Iterator<Item = &'a MileageModel>,
{
    fn total_mileage(self) -> f64 {
        self.map(|i| i.distance).sum()
    }
}

#[derive(Debug, Deserialize)]
pub struct MileageCreate {
    pub distance: f64,
}
