mod config;
mod error;
mod headers;
mod models;
mod routes;
mod templates;
mod utils;

use crate::config::Configuration;
use crate::routes::main_router;
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

    let app = main_router().with_state(pool);

    let socket_addr = config.socket_address();
    let listener = net::TcpListener::bind(socket_addr).await?;
    println!("Listening on {}", socket_addr);

    axum::serve(listener, app).await?;
    Ok(())
}
