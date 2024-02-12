use crate::error::AppResult;
use crate::models::extensions::rides::RideModelsTotalExt;
use crate::repositories::rides::RideRepository;
use crate::templates::{IndexTemplate, RideGroupTemplate, RideTotalTemplate};
use askama::Template;
use axum::extract::State;
use axum::response::Html;
use chrono::Utc;
use itertools::Itertools;

pub async fn get_root(State(repo): State<RideRepository>) -> AppResult<Html<String>> {
    let models = repo.get_all().await?;
    let total = models.iter().total_distance();

    let grouped = models
        .into_iter()
        .group_by(|ride| ride.date.format("%Y-%m").to_string())
        .into_iter()
        .sorted_by_key(|(key, _)| key.clone())
        .map(|(key, group)| (key, group.collect::<Vec<_>>()))
        .map(|(date, rides)| {
            let total = rides.iter().total_distance();
            RideGroupTemplate { date, rides, total }
        })
        .collect::<Vec<_>>();

    let content = IndexTemplate {
        today: Utc::now().date_naive(),
        groups: grouped,
        total: RideTotalTemplate { total },
    }
    .render()?;

    Ok(Html(content))
}
