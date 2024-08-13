use auth::middleware::auth_layer;
use axum::{
    extract::Request,
    http::header,
    middleware::{from_fn, from_fn_with_state, Next},
    response::IntoResponse,
    Router,
};

use crate::utility::state::AppState;

pub mod auth;
pub mod bikes;
pub mod data;
pub mod status;
pub mod strava;
pub mod users;

pub fn api_router(state: AppState) -> Router<AppState> {
    Router::new()
        .nest("/data", data::routes::router())
        .nest("/status", status::routes::router())
        .nest("/users", users::routes::router())
        .nest("/auth", auth::routes::router())
        .nest("/strava", strava::routes::router())
        .nest("/", router_with_auth(state))
        .layer(from_fn(without_caching))
}

fn router_with_auth(state: AppState) -> Router<AppState> {
    Router::new()
        .nest("/bikes", bikes::routes::router_with_auth())
        .nest("/users", users::routes::router_with_auth())
        .nest("/auth", auth::routes::router_with_auth())
        .nest("/strava", strava::routes::router_with_auth())
        .route_layer(from_fn_with_state(state, auth_layer))
}

async fn without_caching(request: Request, next: Next) -> impl IntoResponse {
    let mut response = next.run(request).await.into_response();
    response.headers_mut().insert(
        header::CACHE_CONTROL,
        header::HeaderValue::from_static("no-store"),
    );
    response
}
