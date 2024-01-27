use askama::Template;
use crate::models::MileageModel;

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    pub entries: Vec<MileageModel>,
}

#[derive(Template)]
#[template(path = "entry.html")]
pub struct EntryTemplate {
    pub entry: MileageModel,
}
