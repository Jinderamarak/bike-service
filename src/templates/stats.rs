use askama::Template;

#[derive(Template)]
#[template(path = "stats.html")]
pub struct StatsTemplate {
    pub year: i32,
    pub rides: Vec<usize>,
    pub distances: Vec<f64>,
}
