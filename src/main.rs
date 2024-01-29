mod config;
mod templates;
mod models;

use std::str::FromStr;
use askama::Template;
use axum::{routing::{get, post}, http::StatusCode, Router, Form};
use axum::extract::{Path, State};
use axum::http::{HeaderMap, HeaderName};
use axum::response::Html;
use axum::routing::delete;
use chrono::{Timelike};
use clap::Parser;
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use tokio::net;
use crate::config::Configuration;
use crate::models::mileage::{MileageCreate, MileageModel, MileageRaw};
use crate::templates::{EntryTemplate, IndexTemplate, TotalTemplate};

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

    let listener = net::TcpListener::bind(config.socket_address()).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn root(
    State(pool): State<SqlitePool>,
) -> (StatusCode, Html<String>) {

    let models = sqlx::query_as!(MileageRaw, "SELECT * FROM mileage")
        .fetch_all(&pool)
        .await
        .unwrap()
        .into_iter()
        .map(|x| x.try_into().unwrap())
        .collect::<Vec<MileageModel>>();

    let total = models.iter().fold(0.0, |acc, x| acc + x.distance);
    let content = IndexTemplate {
        entries: models,
        total: TotalTemplate {
            total
        }
    }.render().unwrap();

    (StatusCode::OK, Html(content))
}

async fn create_entry(
    State(pool): State<SqlitePool>,
    Form(payload): Form<MileageCreate>,
) -> (StatusCode, HeaderMap, Html<String>)
{
    let date = chrono::Utc::now().naive_utc().date();
    let mut model = MileageModel {
        id: -1,
        date,
        distance: payload.distance
    };
    let raw = MileageRaw::from(model.clone());

    model.id = sqlx::query!(
        "INSERT INTO mileage (date, distance) VALUES (?, ?)",
        raw.date,
        raw.distance
    )
        .execute(&pool)
        .await
        .unwrap()
        .last_insert_rowid();

    let content = EntryTemplate {
        entry: model
    }.render().unwrap();

    let mut headers = HeaderMap::new();
    headers.insert(HeaderName::from_str("HX-Trigger").unwrap(), "reload-total".parse().unwrap());

    (StatusCode::CREATED, headers, Html(content))
}

async fn delete_entry(
    State(pool): State<SqlitePool>,
    Path(entry_id): Path<i64>,
) -> (StatusCode, HeaderMap, Html<String>)
{
    let xdd = sqlx::query!(
        "DELETE FROM mileage WHERE id = ?",
        entry_id
    )
        .execute(&pool)
        .await
        .unwrap();

    let mut headers = HeaderMap::new();
    headers.insert(HeaderName::from_str("HX-Trigger").unwrap(), "reload-total".parse().unwrap());

    (StatusCode::CREATED, headers, Html("".to_string()))
}

async fn entry_total(
    State(pool): State<SqlitePool>,
) -> (StatusCode, Html<String>)
{
    let models = sqlx::query_as!(MileageRaw, "SELECT * FROM mileage")
        .fetch_all(&pool)
        .await
        .unwrap()
        .into_iter()
        .map(|x| x.try_into().unwrap())
        .collect::<Vec<MileageModel>>();

    let total = models.iter().fold(0.0, |acc, x| acc + x.distance);
    let content = TotalTemplate {
        total
    }.render().unwrap();

    (StatusCode::OK, Html(content))
}