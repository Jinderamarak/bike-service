use std::path::Path;

use axum::Router;
use clap::Parser;
#[cfg(debug_assertions)]
use dotenv::dotenv;
use sqlx::SqlitePool;
use tokio::net;
use tower_http::services::{ServeDir, ServeFile};

use crate::config::Configuration;
use crate::services::api_router;
use crate::utility::state::AppState;

mod config;
mod services;
mod utility;

pub const APP_NAME: Option<&str> = option_env!("CARGO_PKG_NAME");
pub const APP_VERSION: Option<&str> = option_env!("CARGO_PKG_VERSION");

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    #[cfg(debug_assertions)]
    dotenv().ok();

    println!(
        "{} {}",
        APP_NAME.unwrap_or("unknown name"),
        APP_VERSION.unwrap_or("unknown version")
    );

    let config = Configuration::parse();
    println!("{config:?}");

    let pool = SqlitePool::connect(&config.database_url).await?;
    sqlx::migrate!().run(&pool).await?;

    // initialize tracing
    // tracing_subscriber::fmt::init();

    let spa = ServeDir::new(&config.static_dir).not_found_service(ServeFile::new(
        Path::new(&config.static_dir).join("index.html"),
    ));
    let state = AppState::new(pool);
    let app = Router::new()
        .nest("/api", api_router())
        .fallback_service(spa)
        .with_state(state);

    let socket_addr = config.socket_address();
    let listener = net::TcpListener::bind(socket_addr).await?;
    println!("Listening on {}", socket_addr);

    axum::serve(listener, app).await?;
    Ok(())
}
