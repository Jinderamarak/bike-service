use crate::models::rides::{RideModel, RideRaw};

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

pub trait RideModelExt {
    fn get_group_name(&self) -> String;
}

impl RideModelExt for RideModel {
    fn get_group_name(&self) -> String {
        self.date.format("%Y-%m").to_string()
    }
}
