use chrono::Utc;
use sqlx::SqlitePool;

use crate::utility::{
    db_extensions::IntoModels,
    db_format::{format_date, format_date_time},
    error::{AppError, AppResult},
};

use super::models::{RideModel, RidePartial, RideRaw};

#[derive(Clone)]
pub struct RideRepository(SqlitePool);

impl RideRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self(pool)
    }

    pub async fn get_all(&self) -> AppResult<Vec<RideModel>> {
        let models = sqlx::query_as!(
            RideRaw,
            "SELECT * FROM rides WHERE deleted_at IS NULL ORDER BY date DESC, id DESC"
        )
        .fetch_all(&self.0)
        .await?
        .into_models()?;

        Ok(models)
    }

    pub async fn get_all_for_bike(&self, bike_id: i64) -> AppResult<Vec<RideModel>> {
        let models = sqlx::query_as!(
            RideRaw,
            "SELECT * FROM rides WHERE deleted_at IS NULL AND bike_id = ? ORDER BY date DESC, id DESC",
            bike_id
        )
        .fetch_all(&self.0)
        .await?
        .into_models()?;

        Ok(models)
    }

    pub async fn get_all_for_bike_with_date(
        &self,
        bike_id: i64,
        date: &str,
    ) -> AppResult<Vec<RideModel>> {
        let starts_with = format!("{}%", date);
        let models = sqlx::query_as!(
            RideRaw,
            "SELECT * FROM rides WHERE deleted_at IS NULL AND bike_id = ? AND date LIKE ? ORDER BY date DESC, id DESC",
            bike_id,
            starts_with
        )
        .fetch_all(&self.0)
        .await?
        .into_models()?;

        Ok(models)
    }

    pub async fn get_one(&self, ride_id: i64) -> AppResult<RideModel> {
        let model = sqlx::query_as!(
            RideRaw,
            "SELECT * FROM rides WHERE id = ? AND deleted_at IS NULL",
            ride_id
        )
        .fetch_one(&self.0)
        .await?
        .try_into()?;

        Ok(model)
    }

    pub async fn create(&self, bike_id: i64, new: &RidePartial) -> AppResult<RideModel> {
        let date = format_date(&new.date);
        let id = sqlx::query!(
            "INSERT INTO rides (date, distance, description, bike_id) VALUES (?, ?, ?, ?)",
            date,
            new.distance,
            new.description,
            bike_id
        )
        .execute(&self.0)
        .await?
        .last_insert_rowid();

        let model = RideModel {
            id,
            date: new.date,
            distance: new.distance,
            description: new.description.clone(),
            deleted_at: None,
            bike_id,
            strava_ride: None,
        };

        Ok(model)
    }

    pub async fn update(&self, ride_id: i64, update: &RidePartial) -> AppResult<RideModel> {
        let date = format_date(&update.date);
        let affected = sqlx::query!(
            "UPDATE rides SET date = ?, distance = ?, description = ? WHERE id = ? AND deleted_at IS NULL",
            date,
            update.distance,
            update.description,
            ride_id
        )
        .execute(&self.0)
        .await?
        .rows_affected();

        if affected == 0 {
            return Err(AppError::NotFound(format!(
                "No ride found with id {ride_id}",
            )));
        }

        self.get_one(ride_id).await
    }

    pub async fn delete(&self, ride_id: i64) -> AppResult<()> {
        let now = format_date_time(&Utc::now().naive_utc());
        let affected = sqlx::query!(
            "UPDATE rides SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
            now,
            ride_id
        )
        .execute(&self.0)
        .await?
        .rows_affected();

        if affected == 0 {
            return Err(AppError::NotFound(format!(
                "No ride found with id {ride_id}",
            )));
        }

        Ok(())
    }

    pub async fn active_years(&self, bike_id: i64) -> AppResult<Vec<i32>> {
        let years = sqlx::query!(
            "SELECT DISTINCT strftime('%Y', date) as year FROM rides WHERE bike_id = ? AND deleted_at IS NULL ORDER BY year DESC",
            bike_id
        )
        .fetch_all(&self.0)
        .await?;

        let years: Result<Vec<i32>, _> = years
            .into_iter()
            .filter_map(|r| r.year)
            .map(|y| y.parse::<i32>())
            .collect();
        Ok(years.map_err(anyhow::Error::from)?)
    }
}
