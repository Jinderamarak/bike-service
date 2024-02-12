use crate::error::AppResult;
use crate::headers::HtmxHeaderMap;
use crate::models::extensions::rides::RideModelsTotalExt;
use crate::models::rides::{RideCreate, RideUpdate};
use crate::repositories::rides::RideRepository;
use crate::state::AppState;
use crate::templates::{RideEditTemplate, RideGroupTemplate, RideTemplate, RideTotalTemplate};
use askama::Template;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::Html;
use axum::routing::{delete, get, post, put};
use axum::{Form, Router};

pub fn mileage_router() -> Router<AppState> {
    Router::new()
        .route("/", post(create_ride))
        .route("/:id/edit", get(update_ride_start))
        .route("/:id", put(update_ride))
        .route("/:id", delete(delete_ride))
        .route("/total", get(ride_total_distance))
}

async fn create_ride(
    State(repo): State<RideRepository>,
    Form(payload): Form<RideCreate>,
) -> AppResult<(StatusCode, HeaderMap, Html<String>)> {
    let model = repo.create(&payload).await?;
    let date = model.date.format("%Y-%m").to_string();
    let rides = repo.get_group(&date).await?;

    let retarget = format!("#rides-{date}");
    let total = rides.iter().total_distance();
    let content = RideGroupTemplate { date, rides, total }.render()?;
    let headers = HeaderMap::new()
        .with_trigger("reload-total")?
        .with_retarget(&retarget)?;
    Ok((StatusCode::CREATED, headers, Html(content)))
}

async fn update_ride(
    State(repo): State<RideRepository>,
    Path(id): Path<i64>,
    Form(payload): Form<RideUpdate>,
) -> AppResult<(HeaderMap, Html<String>)> {
    let model = repo.update_one(id, &payload).await?;

    let content = RideTemplate { ride: model }.render()?;
    let headers = HeaderMap::new().with_trigger("reload-total")?;
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
    let _ = repo.delete_one(id).await?;

    let headers = HeaderMap::new().with_trigger("reload-total")?;
    Ok((headers, Html("".to_string())))
}

async fn ride_total_distance(State(repo): State<RideRepository>) -> AppResult<Html<String>> {
    let models = repo.get_all().await?;
    let total = models.iter().total_distance();

    let content = RideTotalTemplate { total }.render().unwrap();
    Ok(Html(content))
}
