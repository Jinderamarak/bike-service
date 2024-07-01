use chrono::NaiveDateTime;
use sqlx::SqlitePool;

use crate::utility::{db_format::format_date_time, error::AppResult};

use super::models::{SessionModel, SessionNew, SessionRaw};

#[derive(Clone)]
pub struct AuthRepository(SqlitePool);

impl AuthRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self(pool)
    }

    pub async fn create(&self, session: &SessionNew) -> AppResult<SessionModel> {
        let raw = SessionRaw::from(session.with_id(-1));
        let id = sqlx::query!(
            "INSERT INTO sessions (token, user_id, user_agent, created_at, last_used_at) VALUES (?, ?, ?, ?, ?)",
            raw.token,
            raw.user_id,
            raw.user_agent,
            raw.created_at,
            raw.last_used_at
        )
        .execute(&self.0)
        .await?
        .last_insert_rowid();

        Ok(session.with_id(id))
    }

    pub async fn get_by_token(&self, token: &str) -> AppResult<SessionModel> {
        let model = sqlx::query_as!(SessionRaw, "SELECT * FROM sessions WHERE token = ?", token)
            .fetch_one(&self.0)
            .await?
            .try_into()?;

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
}
