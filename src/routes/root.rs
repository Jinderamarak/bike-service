use askama::Template;
use axum::extract::State;
use axum::response::Html;
use chrono::Utc;
use itertools::Itertools;

use crate::models::extensions::rides::{RideModelExt, RideModelsTotalExt};
use crate::repositories::rides::RideRepository;
use crate::templates::rides::{IndexTemplate, RideGroupTemplate};
use crate::utility::error::AppResult;

pub async fn get_root(State(repo): State<RideRepository>) -> AppResult<Html<String>> {
    let models = repo.get_all().await?;
    let total = models.iter().total_distance();

    let groups = models
        .into_iter()
        .group_by(|ride| ride.get_group_name())
        .into_iter()
        .sorted_by_key(|(key, _)| key.clone())
        .rev()
        .map(|(key, group)| (key, group.collect::<Vec<_>>()))
        .map(|(date, rides)| {
            let total = rides.iter().total_distance();
            RideGroupTemplate { date, rides, total }
        })
        .collect::<Vec<_>>();

    let content = IndexTemplate {
        today: Utc::now().date_naive(),
        groups,
        total,
    }
    .render()?;

    Ok(Html(content))
}
