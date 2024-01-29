mod config;
mod error;
mod models;
mod templates;

use crate::config::Configuration;
use crate::error::AppResult;
use crate::models::mileage::{
    MileageCreate, MileageModel, MileageModelsTotalExt, MileageRaw, MileageRawToModelsExt,
};
use crate::templates::{EntryTemplate, IndexTemplate, TotalTemplate};
use askama::Template;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, HeaderName};
use axum::response::Html;
use axum::routing::delete;
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
    let date = Utc::now().naive_utc().date();
    let mut model = MileageModel {
        id: -1,
        date,
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
