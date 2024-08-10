use sqlx::SqlitePool;

use crate::{services::strava::models::StravaRaw, utility::error::AppResult};

use super::models::StravaModel;

#[derive(Clone)]
pub struct StravaRepository(SqlitePool);

impl StravaRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self(pool)
    }

    pub async fn try_get(&self, user_id: i64) -> AppResult<Option<StravaModel>> {
        let raw = sqlx::query_as!(StravaRaw, "SELECT * FROM strava WHERE user_id = ?", user_id)
            .fetch_optional(&self.0)
            .await?;

        if let Some(raw) = raw {
            return Ok(Some(raw.try_into()?));
        }

        Ok(None)
    }

    pub async fn create(&self, model: StravaModel) -> AppResult<()> {
        let raw = StravaRaw::from(model);
        sqlx::query!(
            "INSERT INTO strava (user_id, strava_id, strava_name, last_sync, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            raw.user_id,
            raw.strava_id,
            raw.strava_name,
            raw.last_sync,
            raw.access_token,
            raw.refresh_token,
            raw.expires_at
        )
        .execute(&self.0)
        .await?;

        Ok(())
    }

    pub async fn update(&self, model: StravaModel) -> AppResult<()> {
        let raw = StravaRaw::from(model);
        sqlx::query!(
            "UPDATE strava SET last_sync = ?, access_token = ?, refresh_token = ?, expires_at = ? WHERE user_id = ?",
            raw.last_sync,
            raw.access_token,
            raw.refresh_token,
            raw.expires_at,
            raw.user_id
        )
        .execute(&self.0)
        .await?;

        Ok(())
    }

    pub async fn delete(&self, user_id: i64) -> AppResult<()> {
        sqlx::query!("DELETE FROM strava WHERE user_id = ?", user_id)
            .execute(&self.0)
            .await?;

        Ok(())
    }
}
