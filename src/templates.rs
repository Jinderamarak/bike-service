use askama::Template;
use chrono::NaiveDate;

use crate::models::rides::RideModel;

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    pub today: NaiveDate,
    pub groups: Vec<RideGroupTemplate>,
    pub total: f64,
}

#[derive(Template)]
#[template(path = "rides/group.html")]
pub struct RideGroupTemplate {
    pub date: String,
    pub rides: Vec<RideModel>,
    pub total: f64,
}

#[derive(Template)]
#[template(path = "rides/ride.html")]
pub struct RideTemplate {
    pub ride: RideModel,
}

#[derive(Template)]
#[template(path = "rides/edit.html")]
pub struct RideEditTemplate {
    pub ride: RideModel,
}

#[derive(Template)]
#[template(path = "rides/total.html")]
pub struct RideTotalTemplate {
    pub total: f64,
}

mod filters {
    use std::fmt::Display;

    pub fn removesuffix<T: Display>(s: T, suffix: &str) -> ::askama::Result<String> {
        let s = s.to_string();
        let trimmed = s.trim_end_matches(suffix).to_string();
        Ok(trimmed)
    }
}
