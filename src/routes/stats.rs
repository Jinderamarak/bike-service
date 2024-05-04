use askama::Template;
use axum::extract::{Path, State};
use axum::response::Html;
use axum::routing::get;
use axum::Router;
use axum_extra::extract::CookieJar;
use chrono::{Datelike, Utc};

use crate::models::extensions::rides::RideModelsTotalExt;
use crate::repositories::rides::RideRepository;
use crate::templates::stats::StatsTemplate;
use crate::utility::cookies::CookieJarExt;
use crate::utility::error::{AppError, AppResult};
use crate::utility::state::AppState;

pub fn stats_router() -> Router<AppState> {
    Router::new()
        .route("/", get(current_year_stats))
        .route("/:year", get(any_year_stats))
}

async fn current_year_stats(
    State(repo): State<RideRepository>,
    jar: CookieJar,
) -> AppResult<Html<String>> {
    let today = Utc::now().date_naive();
    any_year_stats(State(repo), Path(today.year()), jar).await
}

async fn any_year_stats(
    State(repo): State<RideRepository>,
    Path(year): Path<i32>,
    jar: CookieJar,
) -> AppResult<Html<String>> {
    let bike_id = jar
        .get_bike_id()?
        .ok_or(AppError::BadRequest(String::from("Missing bike id")))?;

    let mut rides = vec![];
    let mut distances = vec![];

    for i in 1..=12 {
        let date = format!("{year}-{i:02}");
        let models = repo.get_group_for_bike(bike_id, &date).await?;

        let rides_count = models.len();
        rides.push(rides_count);

        if rides_count > 0 {
            distances.push(models.iter().total_distance());
        } else {
            distances.push(f64::NAN);
        }
    }

    let content = StatsTemplate {
        year,
        rides,
        distances,
    }
    .render()?;
    Ok(Html(content))
}
