use crate::error::AppResult;
use crate::models::rides::{RawRidesToModelsExt, RideModelsTotalExt, RideRaw};
use crate::templates::{IndexTemplate, TotalTemplate};
use askama::Template;
use axum::extract::State;
use axum::response::Html;
use axum::routing::get;
use axum::Router;
use chrono::Utc;
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

    let content = IndexTemplate {
        today: Utc::now().date_naive(),
        rides: models,
        total: TotalTemplate { total },
    }
    .render()?;

    Ok(Html(content))
}
