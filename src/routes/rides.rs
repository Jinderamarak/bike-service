use askama::Template;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::Html;
use axum::routing::{delete, get, post, put};
use axum::{Form, Router};
use chrono::{Datelike, Utc};

use crate::models::extensions::rides::{RideModelExt, RideModelsTotalExt};
use crate::models::rides::{RideCreate, RideUpdate};
use crate::repositories::rides::RideRepository;
use crate::templates::rides::{
    RideEditTemplate, RideGroupTemplate, RideTemplate, RideTotalTemplate, RidesChartsTemplate,
    RidesDeletedTemplate,
};
use crate::utility::error::AppResult;
use crate::utility::headers::HtmxHeaderMap;
use crate::utility::state::AppState;

pub fn mileage_router() -> Router<AppState> {
    Router::new()
        .route("/", post(create_ride))
        .route("/:id/edit", get(update_ride_start))
        .route("/:id", put(update_ride))
        .route("/:id", delete(delete_ride))
        .route("/total", get(rides_total))
        .route("/group/:date/total", get(rides_group_total))
        .route("/deleted", get(list_deleted))
        .route("/:id/restore", put(restore_ride))
        .route("/charts", get(rides_charts_current))
        .route("/charts/:year", get(rides_charts_yearly))
}

async fn create_ride(
    State(repo): State<RideRepository>,
    Form(payload): Form<RideCreate>,
) -> AppResult<(StatusCode, HeaderMap, Html<String>)> {
    let model = repo.create(&payload).await?;
    let date = model.get_group_name();
    let group_size = repo.get_group_size(&date).await?;

    if group_size == 1 {
        let retarget = "#rides".to_string();
        let total = model.distance;
        let content = RideGroupTemplate {
            date,
            rides: vec![model],
            total,
        }
        .render()?;
        let headers = HeaderMap::new()
            .with_trigger("reload-total")?
            .with_retarget(&retarget)?;
        Ok((StatusCode::CREATED, headers, Html(content)))
    } else {
        let retarget = format!("#rides-{date}");
        let trigger = format!("reload-total-{date}");
        let content = RideTemplate { ride: model }.render()?;
        let headers = HeaderMap::new()
            .with_trigger("reload-total")?
            .with_trigger(&trigger)?
            .with_retarget(&retarget)?;
        Ok((StatusCode::CREATED, headers, Html(content)))
    }
}

async fn update_ride(
    State(repo): State<RideRepository>,
    Path(id): Path<i64>,
    Form(payload): Form<RideUpdate>,
) -> AppResult<(HeaderMap, Html<String>)> {
    let old_model = repo.get_one(id).await?;
    let new_model = repo.update_one(id, &payload).await?;

    let old_date = old_model.get_group_name();
    let new_date = new_model.get_group_name();

    let trigger_old = format!("reload-total-{old_date}");
    let trigger_new = format!("reload-total-{new_date}");
    let content = RideTemplate { ride: new_model }.render()?;
    let headers = HeaderMap::new()
        .with_trigger("reload-total")?
        .with_trigger(&trigger_old)?
        .with_trigger(&trigger_new)?;
    Ok((headers, Html(content)))
}

async fn update_ride_start(
    State(repo): State<RideRepository>,
    Path(id): Path<i64>,
) -> AppResult<Html<String>> {
    let model = repo.get_one(id).await?;

    let content = RideEditTemplate { ride: model }.render()?;
    Ok(Html(content))
}

async fn delete_ride(
    State(repo): State<RideRepository>,
    Path(id): Path<i64>,
) -> AppResult<(HeaderMap, Html<String>)> {
    let model = repo.get_one(id).await?;
    repo.delete_one(id).await?;
    let date = model.get_group_name();

    let trigger_group = format!("reload-total-{date}");
    let headers = HeaderMap::new()
        .with_trigger("reload-total")?
        .with_trigger(&trigger_group)?;
    Ok((headers, Html("".to_string())))
}

async fn rides_total(State(repo): State<RideRepository>) -> AppResult<Html<String>> {
    let models = repo.get_all().await?;
    let total = models.iter().total_distance();

    let content = RideTotalTemplate { total }.render()?;
    Ok(Html(content))
}

async fn rides_group_total(
    State(repo): State<RideRepository>,
    Path(date): Path<String>,
) -> AppResult<Html<String>> {
    let models = repo.get_group(&date).await?;
    let total = models.iter().total_distance();

    let content = RideTotalTemplate { total }.render()?;
    Ok(Html(content))
}

async fn list_deleted(State(repo): State<RideRepository>) -> AppResult<Html<String>> {
    let models = repo.get_all_deleted().await?;
    let content = RidesDeletedTemplate { rides: models }.render()?;
    Ok(Html(content))
}

async fn restore_ride(
    State(repo): State<RideRepository>,
    Path(id): Path<i64>,
) -> AppResult<Html<String>> {
    repo.restore_deleted(id).await?;
    Ok(Html("".to_string()))
}

async fn rides_charts_current(State(repo): State<RideRepository>) -> AppResult<Html<String>> {
    let today = Utc::now().date_naive();
    rides_charts_yearly(State(repo), Path(today.year())).await
}

async fn rides_charts_yearly(
    State(repo): State<RideRepository>,
    Path(year): Path<i32>,
) -> AppResult<Html<String>> {
    let mut rides = vec![];
    let mut distances = vec![];

    for i in 1..=12 {
        let date = format!("{year}-{i:02}");
        let models = repo.get_group(&date).await?;

        let rides_count = models.len();
        rides.push(rides_count);

        if rides_count > 0 {
            distances.push(models.iter().total_distance());
        } else {
            distances.push(f64::NAN);
        }
    }

    let content = RidesChartsTemplate {
        year,
        rides,
        distances,
    }
    .render()?;
    Ok(Html(content))
}
