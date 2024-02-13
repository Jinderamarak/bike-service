use clap::Parser;
#[cfg(debug_assertions)]
use dotenv::dotenv;
use sqlx::SqlitePool;
use tokio::net;

use crate::config::Configuration;
use crate::routes::main_router;
use crate::state::AppState;

mod config;
mod error;
mod headers;
mod models;
mod repositories;
mod routes;
mod state;
mod templates;
mod utils;

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

    let state = AppState::new(pool);
    let app = main_router().with_state(state);

    let socket_addr = config.socket_address();
    let listener = net::TcpListener::bind(socket_addr).await?;
    println!("Listening on {}", socket_addr);

    axum::serve(listener, app).await?;
    Ok(())
}
