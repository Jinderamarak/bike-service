use axum::http::{HeaderMap, HeaderName};
use std::str::FromStr;

pub fn add_reload_total(mut headers: HeaderMap) -> HeaderMap {
    headers.insert(
        HeaderName::from_str("HX-Trigger").unwrap(),
        "reload-total".parse().unwrap(),
    );
    headers
}
