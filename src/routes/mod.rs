use crate::error::AppResult;
use crate::models::mileage::{MileageModelsTotalExt, MileageRaw, MileageRawToModelsExt};
use crate::templates::{IndexTemplate, TotalTemplate};
use askama::Template;
use axum::extract::State;
use axum::response::Html;
use sqlx::SqlitePool;

pub mod mileage;

pub async fn get_root(State(pool): State<SqlitePool>) -> AppResult<Html<String>> {
    let models = sqlx::query_as!(MileageRaw, "SELECT * FROM mileage")
        .fetch_all(&pool)
        .await?
        .to_models()?;
    let total = models.iter().total_mileage();

    let content = IndexTemplate {
        entries: models,
        total: TotalTemplate { total },
    }
    .render()?;

    Ok(Html(content))
}
