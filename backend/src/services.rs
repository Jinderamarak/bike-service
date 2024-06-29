use axum::{
    extract::Request,
    http::header,
    middleware::{from_fn, Next},
    response::IntoResponse,
    Router,
};

use crate::utility::state::AppState;

pub mod auth;
pub mod bikes;
pub mod data;
pub mod status;
pub mod users;

pub fn api_router() -> Router<AppState> {
    Router::new()
        .nest("/bikes", bikes::routes::router())
        .nest("/data", data::routes::router())
        .nest("/status", status::routes::router())
        .nest("/users", users::routes::router())
        .layer(from_fn(without_caching))
}

async fn without_caching(request: Request, next: Next) -> impl IntoResponse {
    let mut response = next.run(request).await.into_response();
    response.headers_mut().insert(
        header::CACHE_CONTROL,
        header::HeaderValue::from_static("no-store"),
    );
    response
}
