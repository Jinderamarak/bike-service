use clap::Parser;
#[cfg(debug_assertions)]
use dotenv::dotenv;
use sqlx::SqlitePool;
use tokio::net;

use crate::config::Configuration;
use crate::routes::main_router;
use crate::utility::state::AppState;

mod config;
mod models;
mod repositories;
mod routes;
mod templates;
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

    let state = AppState::new(pool);
    let app = main_router().with_state(state);

    let socket_addr = config.socket_address();
    let listener = net::TcpListener::bind(socket_addr).await?;
    println!("Listening on {}", socket_addr);

    axum::serve(listener, app).await?;
    Ok(())
}
