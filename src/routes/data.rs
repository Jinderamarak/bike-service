use askama::Template;
use axum::{
    extract::{Multipart, State},
    http::HeaderMap,
    response::Html,
    routing::{get, post},
    Router,
};
use csv::Writer;

use crate::{
    models::rides::{RideCreate, RideModel},
    repositories::rides::RideRepository,
    templates::data::DataTemplate,
    utility::{
        error::{AppError, AppResult},
        state::AppState,
    },
    APP_VERSION,
};

pub fn data_router() -> Router<AppState> {
    Router::new()
        .route("/", get(data_root))
        .route("/export", get(export_data))
        .route("/import", post(import_data))
}

async fn data_root(State(ride_repo): State<RideRepository>) -> AppResult<Html<String>> {
    let rides = ride_repo.get_all().await?.len() as i32;
    let content = DataTemplate {
        rides,
        app_version: String::from(APP_VERSION.unwrap_or("unknown")),
    }
    .render()?;
    Ok(Html(content))
}

async fn export_data(State(ride_repo): State<RideRepository>) -> AppResult<(HeaderMap, String)> {
    let rides = ride_repo.get_all().await?;
    let mut writer = Writer::from_writer(vec![]);
    for ride in rides {
        writer.serialize(ride)?;
    }

    let data = String::from_utf8(writer.into_inner()?)?;

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", "text/csv".parse()?);
    headers.insert(
        "Content-Disposition",
        "attachment;filename=export.csv".parse()?,
    );
    Ok((headers, data))
}

async fn import_data(
    State(ride_repo): State<RideRepository>,
    mut multipart: Multipart,
) -> AppResult<String> {
    let mut file_content = None;
    while let Some(field) = multipart.next_field().await? {
        if let Some("rides-file") = field.name() {
            file_content = Some(field.bytes().await?.to_vec());
            break;
        }
    }

    if let Some(content) = file_content {
        let mut reader = csv::Reader::from_reader(content.as_slice());
        for result in reader.deserialize() {
            let ride: RideModel = result?;
            ride_repo
                .create(
                    ride.bike_id,
                    &RideCreate {
                        date: ride.date,
                        distance: ride.distance,
                        description: ride.description.unwrap_or_default(),
                    },
                )
                .await?;
        }

        return Ok(String::from("Data imported"));
    }

    Err(AppError::BadRequest(String::from("No file provided")))
}
