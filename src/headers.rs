use crate::error::AppResult;
use axum::http::{HeaderMap, HeaderName};
use std::str::FromStr;

pub trait HtmxHeaderMap: Sized {
    fn with_refresh(self) -> Self;
    fn with_retarget(self, target: &str) -> AppResult<Self>;
    fn with_trigger(self, event: &str) -> AppResult<Self>;
}

impl HtmxHeaderMap for HeaderMap {
    fn with_refresh(mut self) -> Self {
        self.insert(
            HeaderName::from_str("HX-Refresh")
                .expect("Expected \"HX-Refresh\" to be valid header name"),
            "true"
                .parse()
                .expect("Expected \"true\" to be valid header value"),
        );
        self
    }

    fn with_retarget(mut self, target: &str) -> AppResult<Self> {
        self.insert(
            HeaderName::from_str("HX-Retarget")
                .expect("Expected \"HX-Retarget\" to be valid header name"),
            target.parse().map_err(|e| anyhow::Error::from(e))?,
        );
        Ok(self)
    }

    fn with_trigger(mut self, event: &str) -> AppResult<Self> {
        self.insert(
            HeaderName::from_str("HX-Trigger")
                .expect("Expected \"HX-Trigger\" to be valid header name"),
            event.parse().map_err(|e| anyhow::Error::from(e))?,
        );
        Ok(self)
    }
}
