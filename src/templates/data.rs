use askama::Template;

#[derive(Template)]
#[template(path = "data.html")]
pub struct DataTemplate {
    pub rides: i32,
    pub app_version: String,
}
