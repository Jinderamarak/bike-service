mod config;
mod error;
mod models;
mod templates;

use crate::config::Configuration;
use crate::error::AppResult;
use crate::models::mileage::{
    MileageCreate, MileageEdit, MileageModel, MileageModelsTotalExt, MileageRaw,
    MileageRawToModelsExt,
};
use crate::templates::{EntryEditTemplate, EntryTemplate, IndexTemplate, TotalTemplate};
use askama::Template;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, HeaderName};
use axum::response::Html;
use axum::routing::{delete, put};
use axum::{
    http::StatusCode,
    routing::{get, post},
    Form, Router,
};
use chrono::Utc;
use clap::Parser;
use dotenv::dotenv;
use sqlx::SqlitePool;
use std::str::FromStr;
use tokio::net;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    #[cfg(debug_assertions)]
    dotenv().ok();

    let config = Configuration::parse();
    println!("{config:?}");

    let pool = SqlitePool::connect(&config.database_url).await?;
    sqlx::migrate!().run(&pool).await?;

    // initialize tracing
    // tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/", get(root))
        .route("/entry", post(create_entry))
        .route("/entry/:entry_id/edit", get(start_edit_entry))
        .route("/entry/:entry_id", put(edit_entry))
        .route("/entry/:entry_id", delete(delete_entry))
        .route("/total", get(entry_total))
        .with_state(pool);

    let socket_addr = config.socket_address();
    let listener = net::TcpListener::bind(socket_addr).await?;
    println!("Listening on {}", socket_addr);

    axum::serve(listener, app).await?;
    Ok(())
}

async fn root(State(pool): State<SqlitePool>) -> AppResult<Html<String>> {
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

async fn create_entry(
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

    let mut headers = HeaderMap::new();
    headers.insert(
        HeaderName::from_str("HX-Trigger").unwrap(),
        "reload-total".parse().unwrap(),
    );

    Ok((StatusCode::CREATED, headers, Html(content)))
}

async fn edit_entry(
    State(pool): State<SqlitePool>,
    Path(entry_id): Path<i64>,
    Form(payload): Form<MileageEdit>,
) -> AppResult<(HeaderMap, Html<String>)> {
    let model = MileageModel {
        id: entry_id,
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

    let mut headers = HeaderMap::new();
    headers.insert(
        HeaderName::from_str("HX-Trigger").unwrap(),
        "reload-total".parse().unwrap(),
    );

    Ok((headers, Html(content)))
}

async fn start_edit_entry(
    State(pool): State<SqlitePool>,
    Path(entry_id): Path<i64>,
) -> AppResult<Html<String>> {
    let raw = sqlx::query_as!(MileageRaw, "SELECT * FROM mileage WHERE id = ?", entry_id)
        .fetch_one(&pool)
        .await?;
    let model = MileageModel::try_from(raw)?;

    let content = EntryEditTemplate { entry: model }.render()?;
    Ok(Html(content))
}

async fn delete_entry(
    State(pool): State<SqlitePool>,
    Path(entry_id): Path<i64>,
) -> AppResult<(HeaderMap, Html<String>)> {
    let _ = sqlx::query!("DELETE FROM mileage WHERE id = ?", entry_id)
        .execute(&pool)
        .await?;

    let mut headers = HeaderMap::new();
    headers.insert(
        HeaderName::from_str("HX-Trigger").unwrap(),
        "reload-total".parse().unwrap(),
    );

    Ok((headers, Html("".to_string())))
}

async fn entry_total(State(pool): State<SqlitePool>) -> AppResult<Html<String>> {
    let total = sqlx::query_as!(MileageRaw, "SELECT * FROM mileage")
        .fetch_all(&pool)
        .await?
        .to_models()?
        .iter()
        .total_mileage();

    let content = TotalTemplate { total }.render().unwrap();
    Ok(Html(content))
}
