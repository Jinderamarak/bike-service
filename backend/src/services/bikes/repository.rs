use chrono::Utc;
use sqlx::SqlitePool;

use crate::utility::{
    db_extensions::IntoModels,
    db_format::format_date_time,
    error::{AppError, AppResult},
};

use super::models::{BikeModel, BikePartial, BikeRaw};

#[derive(Clone)]
pub struct BikeRepository(SqlitePool);

impl BikeRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self(pool)
    }

    pub async fn assert_owner(&self, bike_id: i64, user_id: i64) -> AppResult<()> {
        let something = sqlx::query!(
            "SELECT id FROM bikes WHERE id = ? AND owner_id = ? AND deleted_at IS NULL",
            bike_id,
            user_id
        )
        .fetch_optional(&self.0)
        .await?;

        match something {
            Some(_) => Ok(()),
            None => Err(AppError::Forbidden),
        }
    }

    pub async fn get_all(&self, owner_id: i64) -> AppResult<Vec<BikeModel>> {
        let models = sqlx::query_as!(
            BikeRaw,
            "SELECT * FROM bikes WHERE owner_id = ? AND deleted_at IS NULL",
            owner_id
        )
        .fetch_all(&self.0)
        .await?
        .into_models()?;

        Ok(models)
    }

    pub async fn get_one(&self, bike_id: i64) -> AppResult<BikeModel> {
        let model = sqlx::query_as!(
            BikeRaw,
            "SELECT * FROM bikes WHERE id = ? AND deleted_at IS NULL",
            bike_id
        )
        .fetch_one(&self.0)
        .await?
        .try_into()?;

        Ok(model)
    }

    pub async fn get_by_strava_gear(
        &self,
        owner_id: i64,
        strava_gear: Option<&str>,
    ) -> AppResult<Vec<BikeModel>> {
        let model = sqlx::query_as!(
            BikeRaw,
            "SELECT * FROM bikes WHERE owner_id = ? AND strava_gear = ? AND deleted_at IS NULL",
            owner_id,
            strava_gear
        )
        .fetch_all(&self.0)
        .await?
        .into_iter()
        .map(BikeModel::try_from)
        .collect::<Result<Vec<BikeModel>, _>>()?;

        Ok(model)
    }

    pub async fn create(&self, owner_id: i64, new: &BikePartial) -> AppResult<BikeModel> {
        let id = sqlx::query!(
            "INSERT INTO bikes (name, description, color, strava_gear, owner_id) VALUES (?, ?, ?, ?, ?)",
            new.name,
            new.description,
            new.color,
            new.strava_gear,
            owner_id
        )
        .execute(&self.0)
        .await?
        .last_insert_rowid();

        let model = BikeModel {
            id,
            name: new.name.clone(),
            description: new.description.clone(),
            deleted_at: None,
            color: new.color.clone(),
            owner_id,
            strava_gear: new.strava_gear.clone(),
        };

        Ok(model)
    }

    pub async fn update(
        &self,
        bike_id: i64,
        owner_id: i64,
        update: &BikePartial,
    ) -> AppResult<BikeModel> {
        let affected = sqlx::query!(
            "UPDATE bikes SET name = ?, description = ?, color = ?, strava_gear = ? WHERE id = ? AND deleted_at IS NULL",
            update.name,
            update.description,
            update.color,
            update.strava_gear,
            bike_id
        )
        .execute(&self.0)
        .await?
        .rows_affected();

        if affected == 0 {
            return Err(AppError::NotFound(format!(
                "No bike found with id {bike_id}",
            )));
        }

        let model = BikeModel {
            id: bike_id,
            name: update.name.clone(),
            description: update.description.clone(),
            deleted_at: None,
            color: update.color.clone(),
            owner_id,
            strava_gear: update.strava_gear.clone(),
        };

        Ok(model)
    }

    pub async fn delete(&self, bike_id: i64) -> AppResult<()> {
        let now = format_date_time(&Utc::now().naive_utc());
        let affected = sqlx::query!(
            "UPDATE bikes SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
            now,
            bike_id
        )
        .execute(&self.0)
        .await?
        .rows_affected();

        if affected == 0 {
            return Err(AppError::NotFound(format!(
                "No bike found with id {bike_id}",
            )));
        }

        Ok(())
    }
}
