use axum_extra::extract::{cookie::Cookie, CookieJar};

use super::error::AppResult;

pub const BIKE_ID_COOKIE: &str = "bike_id";

pub trait CookieJarExt {
    fn get_bike_id(&self) -> AppResult<Option<i64>>;
    fn set_bike_id(self, bike_id: i64) -> CookieJar;
}

impl CookieJarExt for CookieJar {
    fn get_bike_id(&self) -> AppResult<Option<i64>> {
        if let Some(bike_id) = self.get(BIKE_ID_COOKIE) {
            Ok(Some(
                bike_id
                    .value()
                    .parse::<i64>()
                    .map_err(anyhow::Error::from)?,
            ))
        } else {
            Ok(None)
        }
    }

    fn set_bike_id(self, bike_id: i64) -> CookieJar {
        self.remove(BIKE_ID_COOKIE)
            .add(Cookie::new(BIKE_ID_COOKIE, bike_id.to_string()))
    }
}
