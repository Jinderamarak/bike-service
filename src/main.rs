mod config;
mod error;
mod events;
mod models;
mod routes;
mod templates;

use crate::config::Configuration;
use crate::routes::get_root;
use crate::routes::mileage::{
    delete_mileage, get_mileage_edit, get_mileage_total, post_mileage, put_mileage,
};
use axum::routing::{delete, put};
use axum::{
    routing::{get, post},
    Router,
};
use clap::Parser;
use sqlx::SqlitePool;
use tokio::net;

#[cfg(debug_assertions)]
use dotenv::dotenv;

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
        .route("/", get(get_root))
        .route("/mileage", post(post_mileage))
        .route("/mileage/:id/edit", get(get_mileage_edit))
        .route("/mileage/:id", put(put_mileage))
        .route("/mileage/:id", delete(delete_mileage))
        .route("/mileage/total", get(get_mileage_total))
        .with_state(pool);

    let socket_addr = config.socket_address();
    let listener = net::TcpListener::bind(socket_addr).await?;
    println!("Listening on {}", socket_addr);

    axum::serve(listener, app).await?;
    Ok(())
}
