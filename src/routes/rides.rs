use crate::error::AppResult;
use crate::headers::HtmxHeaderMap;
use crate::models::extensions::rides::{RawRidesToModelsExt, RideModelsTotalExt};
use crate::models::rides::{RideCreate, RideEdit, RideModel, RideRaw};
use crate::templates::{RideEditTemplate, RideTemplate, RideTotalTemplate};
use crate::utils::some_text_or_none;
use askama::Template;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::Html;
use axum::routing::{delete, get, post, put};
use axum::{Form, Router};
use sqlx::SqlitePool;

pub fn mileage_router() -> Router<SqlitePool> {
    Router::new()
        .route("/", post(create_ride))
        .route("/:id/edit", get(update_ride_start))
        .route("/:id", put(update_ride))
        .route("/:id", delete(delete_ride))
        .route("/total", get(ride_total_distance))
}

async fn create_ride(
    State(pool): State<SqlitePool>,
    Form(payload): Form<RideCreate>,
) -> AppResult<(StatusCode, HeaderMap, Html<String>)> {
    let mut model = RideModel {
        id: -1,
        date: payload.date,
        distance: payload.distance,
        description: some_text_or_none(payload.description),
    };
    let raw = RideRaw::from(model.clone());

    model.id = sqlx::query!(
        "INSERT INTO rides (date, distance, description) VALUES (?, ?, ?)",
        raw.date,
        raw.distance,
        raw.description
    )
    .execute(&pool)
    .await?
    .last_insert_rowid();

    let content = RideTemplate { ride: model }.render()?;
    let headers = HeaderMap::new().with_trigger("reload-total");
    Ok((StatusCode::CREATED, headers, Html(content)))
}

async fn update_ride(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Form(payload): Form<RideEdit>,
) -> AppResult<(HeaderMap, Html<String>)> {
    let model = RideModel {
        id,
        date: payload.date,
        distance: payload.distance,
        description: some_text_or_none(payload.description),
    };
    let raw = RideRaw::from(model.clone());

    let _ = sqlx::query!(
        "UPDATE rides SET date = ?, distance = ?, description = ? WHERE id = ?",
        raw.date,
        raw.distance,
        raw.description,
        raw.id
    )
    .execute(&pool)
    .await?;

    let content = RideTemplate { ride: model }.render()?;
    let headers = HeaderMap::new().with_trigger("reload-total");
    Ok((headers, Html(content)))
}

async fn update_ride_start(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> AppResult<Html<String>> {
    let raw = sqlx::query_as!(RideRaw, "SELECT * FROM rides WHERE id = ?", id)
        .fetch_one(&pool)
        .await?;
    let model = RideModel::try_from(raw)?;

    let content = RideEditTemplate { ride: model }.render()?;
    Ok(Html(content))
}

async fn delete_ride(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> AppResult<(HeaderMap, Html<String>)> {
    let _ = sqlx::query!("DELETE FROM rides WHERE id = ?", id)
        .execute(&pool)
        .await?;

    let headers = HeaderMap::new().with_trigger("reload-total");
    Ok((headers, Html("".to_string())))
}

async fn ride_total_distance(State(pool): State<SqlitePool>) -> AppResult<Html<String>> {
    let total = sqlx::query_as!(RideRaw, "SELECT * FROM rides")
        .fetch_all(&pool)
        .await?
        .to_models()?
        .iter()
        .total_distance();

    let content = RideTotalTemplate { total }.render().unwrap();
    Ok(Html(content))
}
