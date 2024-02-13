use crate::error::{AppError, AppResult};
use axum::http::header::InvalidHeaderValue;
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
        let name = HeaderName::from_str("HX-Trigger")
            .expect("Expected \"HX-Trigger\" to be valid header name");

        if let Some(events) = self.get(&name) {
            let events = events.to_str().map_err(|e| anyhow::Error::from(e))?;
            let events = format!("{events}, {event}");
            self.insert(name, events.parse()?);
        } else {
            self.insert(name, event.parse()?);
        }
        Ok(self)
    }
}

impl From<InvalidHeaderValue> for AppError {
    fn from(value: InvalidHeaderValue) -> Self {
        anyhow::Error::from(value).into()
    }
}
