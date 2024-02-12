use crate::error::AppResult;
use crate::models::extensions::rides::{RawRidesToModelsExt, RideModelsTotalExt};
use crate::models::rides::RideRaw;
use crate::templates::{IndexTemplate, TotalTemplate};
use askama::Template;
use axum::extract::State;
use axum::response::Html;
use axum::routing::get;
use axum::Router;
use chrono::Utc;
use itertools::Itertools;
use sqlx::SqlitePool;

pub fn root_router() -> Router<SqlitePool> {
    Router::new().route("/", get(get_root))
}

async fn get_root(State(pool): State<SqlitePool>) -> AppResult<Html<String>> {
    let models = sqlx::query_as!(RideRaw, "SELECT * FROM rides ORDER BY date ASC")
        .fetch_all(&pool)
        .await?
        .to_models()?;
    let total = models.iter().total_distance();

    let grouped = models
        .into_iter()
        .group_by(|ride| ride.date.format("%Y-%m").to_string())
        .into_iter()
        .sorted_by_key(|(key, _)| key.clone())
        .map(|(key, group)| (key, group.collect::<Vec<_>>()))
        .collect::<Vec<_>>();

    let content = IndexTemplate {
        today: Utc::now().date_naive(),
        rides: grouped,
        total: TotalTemplate { total },
    }
    .render()?;

    Ok(Html(content))
}
