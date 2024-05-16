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

    pub async fn check_exists(&self, ride_id: i64) -> AppResult<()> {
        let ride = sqlx::query_as!(
            RideRaw,
            "SELECT * FROM rides WHERE id = ? AND deleted_at IS NULL",
            ride_id
        )
        .fetch_optional(&self.0)
        .await?;

        match ride {
            Some(_) => Ok(()),
            None => Err(AppError::NotFound(format!(
                "No ride found with id {ride_id}",
            ))),
        }
    }

    pub async fn get_all(&self) -> AppResult<Vec<RideModel>> {
        let models = sqlx::query_as!(
            RideRaw,
            "SELECT * FROM rides WHERE deleted_at IS NULL ORDER BY date DESC"
        )
        .fetch_all(&self.0)
        .await?
        .into_models()?;

        Ok(models)
    }

    pub async fn get_all_for_bike(&self, bike_id: i64) -> AppResult<Vec<RideModel>> {
        let models = sqlx::query_as!(
            RideRaw,
            "SELECT * FROM rides WHERE deleted_at IS NULL AND bike_id = ? ORDER BY date DESC",
            bike_id
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

    pub async fn total_distance_for_bike(&self, ride_id: i64) -> AppResult<f64> {
        let total = sqlx::query!(
            "SELECT SUM(distance) as total FROM rides WHERE bike_id = ? AND deleted_at IS NULL",
            ride_id
        )
        .fetch_one(&self.0)
        .await?
        .total;

        match total {
            Some(total) => Ok(total),
            None => Ok(0.0),
        }
    }
}
