mod config;
mod templates;
mod models;

use askama::Template;
use axum::{routing::{get, post}, http::StatusCode, Router, Form};
use axum::extract::{Path, State};
use axum::response::Html;
use axum::routing::delete;
use chrono::{Timelike};
use clap::Parser;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use tokio::net;
use crate::config::Configuration;
use crate::models::{CreateMileage, MileageModel, NaiveDateTimeExt};
use crate::templates::{EntryTemplate, IndexTemplate};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let config = Configuration::parse();

    let pool = SqlitePool::connect(&config.database_url).await?;
    sqlx::migrate!().run(&pool).await?;

    // initialize tracing
    // tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/", get(root))
        .route("/entry", post(create_entry))
        .route("/entry/:entry_id", delete(delete_entry))
        .with_state(pool);

    let listener = net::TcpListener::bind(config.socket_address()).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn root(
    State(pool): State<SqlitePool>,
) -> (StatusCode, Html<String>) {

    let models = sqlx::query_as::<_, MileageModel>("SELECT * FROM mileage")
        .fetch_all(&pool)
        .await
        .unwrap();

    let content = IndexTemplate {
        entries: models
    }.render().unwrap();

    (StatusCode::OK, Html(content))
}

async fn create_entry(
    State(pool): State<SqlitePool>,
    Form(payload): Form<CreateMileage>,
) -> (StatusCode, Html<String>)
{
    let timestamp = chrono::Utc::now().naive_utc().with_nanosecond(0).unwrap();
    let time_string = timestamp.for_sqlite();

    let id = sqlx::query!(
        "INSERT INTO mileage (timestamp, distance) VALUES (?, ?)",
        time_string, payload.distance
    )
        .execute(&pool)
        .await
        .unwrap()
        .last_insert_rowid();

    let inserted = MileageModel {
        id, timestamp, distance: payload.distance
    };

    let content = EntryTemplate {
        entry: inserted
    }.render().unwrap();

    (StatusCode::CREATED, Html(content))
}

async fn delete_entry(
    State(pool): State<SqlitePool>,
    Path(entry_id): Path<i64>,
) -> (StatusCode, Html<String>)
{
    let xdd = sqlx::query!(
        "DELETE FROM mileage WHERE id = ?",
        entry_id
    )
        .execute(&pool)
        .await
        .unwrap();

    (StatusCode::CREATED, Html("".to_string()))
}
