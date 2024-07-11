use chrono::NaiveDateTime;
use sqlx::SqlitePool;

use crate::utility::{db_format::format_date_time, error::AppResult};

use super::models::{SessionModel, SessionRaw};

#[derive(Clone)]
pub struct AuthRepository(SqlitePool);

impl AuthRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self(pool)
    }

    pub async fn create(&self, session: &SessionModel) -> AppResult<()> {
        let raw = SessionRaw::from(session.clone());
        let _ = sqlx::query!(
            "INSERT INTO sessions (id, token, user_id, user_agent, created_at, last_used_at) VALUES (?, ?, ?, ?, ?, ?)",
            raw.id,
            raw.token,
            raw.user_id,
            raw.user_agent,
            raw.created_at,
            raw.last_used_at
        )
        .execute(&self.0)
        .await?;

        Ok(())
    }

    pub async fn try_get_by_token(&self, token: &str) -> AppResult<Option<SessionModel>> {
        let model = sqlx::query_as!(SessionRaw, "SELECT * FROM sessions WHERE token = ?", token)
            .fetch_optional(&self.0)
            .await?
            .map(|raw| raw.try_into())
            .transpose()?;

        Ok(model)
    }

    pub async fn update(&self, token: &str, last_used_at: &NaiveDateTime) -> AppResult<()> {
        let last_used_at = format_date_time(last_used_at);
        sqlx::query!(
            "UPDATE sessions SET last_used_at = ? WHERE token = ?",
            last_used_at,
            token
        )
        .execute(&self.0)
        .await?;

        Ok(())
    }

    pub async fn revoke(
        &self,
        user_id: i64,
        session_id: &str,
        time: &NaiveDateTime,
    ) -> AppResult<()> {
        let now = format_date_time(time);
        sqlx::query!(
            "UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND id = ?",
            now,
            user_id,
            session_id
        )
        .execute(&self.0)
        .await?;

        Ok(())
    }
}
