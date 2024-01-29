use crate::error::AppResult;
use crate::events;
use crate::models::mileage::{
    MileageCreate, MileageEdit, MileageModel, MileageModelsTotalExt, MileageRaw,
    MileageRawToModelsExt,
};
use crate::templates::{EntryEditTemplate, EntryTemplate, TotalTemplate};
use askama::Template;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::Html;
use axum::Form;
use sqlx::SqlitePool;

pub async fn post_mileage(
    State(pool): State<SqlitePool>,
    Form(payload): Form<MileageCreate>,
) -> AppResult<(StatusCode, HeaderMap, Html<String>)> {
    let mut model = MileageModel {
        id: -1,
        date: payload.date,
        distance: payload.distance,
    };
    let raw = MileageRaw::from(model.clone());

    model.id = sqlx::query!(
        "INSERT INTO mileage (date, distance) VALUES (?, ?)",
        raw.date,
        raw.distance
    )
    .execute(&pool)
    .await?
    .last_insert_rowid();

    let content = EntryTemplate { entry: model }.render()?;
    let headers = events::add_reload_total(HeaderMap::new());
    Ok((StatusCode::CREATED, headers, Html(content)))
}

pub async fn put_mileage(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Form(payload): Form<MileageEdit>,
) -> AppResult<(HeaderMap, Html<String>)> {
    let model = MileageModel {
        id,
        date: payload.date,
        distance: payload.distance,
    };
    let raw = MileageRaw::from(model.clone());

    let _ = sqlx::query!(
        "UPDATE mileage SET date = ?, distance = ? WHERE id = ?",
        raw.date,
        raw.distance,
        raw.id
    )
    .execute(&pool)
    .await?;

    let content = EntryTemplate { entry: model }.render()?;
    let headers = events::add_reload_total(HeaderMap::new());
    Ok((headers, Html(content)))
}

pub async fn get_mileage_edit(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> AppResult<Html<String>> {
    let raw = sqlx::query_as!(MileageRaw, "SELECT * FROM mileage WHERE id = ?", id)
        .fetch_one(&pool)
        .await?;
    let model = MileageModel::try_from(raw)?;

    let content = EntryEditTemplate { entry: model }.render()?;
    Ok(Html(content))
}

pub async fn delete_mileage(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> AppResult<(HeaderMap, Html<String>)> {
    let _ = sqlx::query!("DELETE FROM mileage WHERE id = ?", id)
        .execute(&pool)
        .await?;

    let headers = events::add_reload_total(HeaderMap::new());
    Ok((headers, Html("".to_string())))
}

pub async fn get_mileage_total(State(pool): State<SqlitePool>) -> AppResult<Html<String>> {
    let total = sqlx::query_as!(MileageRaw, "SELECT * FROM mileage")
        .fetch_all(&pool)
        .await?
        .to_models()?
        .iter()
        .total_mileage();

    let content = TotalTemplate { total }.render().unwrap();
    Ok(Html(content))
}
