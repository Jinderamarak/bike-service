use axum::http::{HeaderMap, HeaderName};
use std::str::FromStr;

pub trait HtmxHeaderMap: Sized {
    fn with_refresh(self) -> Self;
    fn with_retarget(self, target: &str) -> Self;
    fn with_trigger(self, event: &str) -> Self;
}

impl HtmxHeaderMap for HeaderMap {
    fn with_refresh(mut self) -> Self {
        self.insert(
            HeaderName::from_str("HX-Refresh").unwrap(),
            "true".parse().unwrap(),
        );
        self
    }

    fn with_retarget(mut self, target: &str) -> Self {
        self.insert(
            HeaderName::from_str("HX-Retarget").unwrap(),
            target.parse().unwrap(),
        );
        self
    }

    fn with_trigger(mut self, event: &str) -> Self {
        self.insert(
            HeaderName::from_str("HX-Trigger").unwrap(),
            event.parse().unwrap(),
        );
        self
    }
}
