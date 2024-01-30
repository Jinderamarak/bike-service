use crate::models::rides::RideModel;
use askama::Template;
use chrono::NaiveDate;

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    pub today: NaiveDate,
    pub entries: Vec<RideModel>,
    pub total: TotalTemplate,
}

#[derive(Template)]
#[template(path = "entry.html")]
pub struct EntryTemplate {
    pub entry: RideModel,
}

#[derive(Template)]
#[template(path = "entry-edit.html")]
pub struct EntryEditTemplate {
    pub entry: RideModel,
}

#[derive(Template)]
#[template(path = "total.html")]
pub struct TotalTemplate {
    pub total: f64,
}
