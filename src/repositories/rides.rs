use sqlx::SqlitePool;

use crate::error::{AppError, AppResult};
use crate::models::extensions::rides::RawRidesToModelsExt;
use crate::models::rides::{RideCreate, RideModel, RideRaw, RideUpdate};
use crate::utils::some_text_or_none;

#[derive(Clone)]
pub struct RideRepository(SqlitePool);

impl RideRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self(pool)
    }

    pub async fn get_all(&self) -> AppResult<Vec<RideModel>> {
        let models = sqlx::query_as!(RideRaw, "SELECT * FROM rides ORDER BY date ASC")
            .fetch_all(&self.0)
            .await?
            .to_models()?;
        Ok(models)
    }

    pub async fn get_group(&self, date: &str) -> AppResult<Vec<RideModel>> {
        let starts_with = format!("{date}%");
        let models = sqlx::query_as!(
            RideRaw,
            "SELECT * FROM rides WHERE date LIKE ? ORDER BY date ASC",
            starts_with
        )
        .fetch_all(&self.0)
        .await?
        .to_models()?;
        Ok(models)
    }

    pub async fn get_group_size(&self, date: &str) -> AppResult<i32> {
        let starts_with = format!("{date}%");
        let count = sqlx::query!(
            "SELECT COUNT(*) as count FROM rides WHERE date LIKE ?",
            starts_with
        )
        .fetch_one(&self.0)
        .await?
        .count;
        Ok(count)
    }

    pub async fn get_one(&self, id: i64) -> AppResult<RideModel> {
        let model = sqlx::query_as!(RideRaw, "SELECT * FROM rides WHERE id = ?", id)
            .fetch_one(&self.0)
            .await?
            .try_into()?;

        Ok(model)
    }

    pub async fn create(&self, new: &RideCreate) -> AppResult<RideModel> {
        let mut model = RideModel {
            id: -1,
            date: new.date,
            distance: new.distance,
            description: some_text_or_none(new.description.trim().to_string()),
        };
        let raw = RideRaw::from(model.clone());

        let id = sqlx::query!(
            "INSERT INTO rides (date, distance, description) VALUES (?, ?, ?)",
            raw.date,
            raw.distance,
            raw.description
        )
        .execute(&self.0)
        .await?
        .last_insert_rowid();

        model.id = id;
        Ok(model)
    }

    pub async fn update_one(&self, id: i64, update: &RideUpdate) -> AppResult<RideModel> {
        let model = RideModel {
            id,
            date: update.date,
            distance: update.distance,
            description: some_text_or_none(update.description.trim().to_string()),
        };
        let raw = RideRaw::from(model.clone());

        let affected = sqlx::query!(
            "UPDATE rides SET date = ?, distance = ?, description = ? WHERE id = ?",
            raw.date,
            raw.distance,
            raw.description,
            raw.id
        )
        .execute(&self.0)
        .await?
        .rows_affected();

        if affected == 0 {
            return Err(AppError::NotFound(format!("Ride with id {} not found", id)));
        }

        if affected > 1 {
            //  Corrupted data, should never happen
            return Err(AppError::Other(anyhow::anyhow!(
                "More than one ride with id {}",
                id
            )));
        }

        Ok(model)
    }

    pub async fn delete_one(&self, id: i64) -> AppResult<()> {
        let affected = sqlx::query!("DELETE FROM rides WHERE id = ?", id)
            .execute(&self.0)
            .await?
            .rows_affected();

        if affected == 0 {
            return Err(AppError::NotFound(format!("Ride with id {} not found", id)));
        }

        if affected > 1 {
            //  Corrupted data, should never happen
            return Err(AppError::Other(anyhow::anyhow!(
                "More than one ride with id {}",
                id
            )));
        }

        Ok(())
    }
}
