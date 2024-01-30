use crate::models::rides::RideModel;
use askama::Template;
use chrono::NaiveDate;

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    pub today: NaiveDate,
    pub rides: Vec<RideModel>,
    pub total: TotalTemplate,
}

#[derive(Template)]
#[template(path = "ride.html")]
pub struct RideTemplate {
    pub ride: RideModel,
}

#[derive(Template)]
#[template(path = "ride-edit.html")]
pub struct RideEditTemplate {
    pub ride: RideModel,
}

#[derive(Template)]
#[template(path = "total.html")]
pub struct TotalTemplate {
    pub total: f64,
}
