use chrono::Utc;
use sqlx::SqlitePool;

use crate::utility::{
    db_format::format_date_time,
    error::{AppError, AppResult},
};

use super::models::{UserModel, UserPartial, UserRaw};

#[derive(Clone)]
pub struct UserRepository(SqlitePool);

impl UserRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self(pool)
    }

    pub async fn get_by_id(&self, user_id: i64) -> AppResult<UserModel> {
        let model = sqlx::query_as!(
            UserRaw,
            "SELECT * FROM users WHERE id = ? AND deleted_at IS NULL",
            user_id
        )
        .fetch_one(&self.0)
        .await?
        .try_into()?;

        Ok(model)
    }

    pub async fn get_by_username(&self, username: &str) -> AppResult<UserModel> {
        let model = sqlx::query_as!(
            UserRaw,
            "SELECT * FROM users WHERE username = ? AND deleted_at IS NULL",
            username
        )
        .fetch_one(&self.0)
        .await?
        .try_into()?;

        Ok(model)
    }

    pub async fn create(&self, new: &UserPartial) -> AppResult<UserModel> {
        let now = Utc::now().naive_utc();
        let timestamp = format_date_time(&now);
        let id = sqlx::query!(
            "INSERT INTO users (username, monthly_goal, created_at) VALUES (?, ?, ?)",
            new.username,
            new.monthly_goal,
            timestamp
        )
        .execute(&self.0)
        .await?
        .last_insert_rowid();

        let model = UserModel {
            id,
            username: new.username.clone(),
            monthly_goal: new.monthly_goal,
            created_at: now,
            deleted_at: None,
        };

        Ok(model)
    }

    pub async fn delete(&self, user_id: i64) -> AppResult<()> {
        let now = format_date_time(&Utc::now().naive_utc());
        let affected = sqlx::query!(
            "UPDATE users SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
            now,
            user_id
        )
        .execute(&self.0)
        .await?
        .rows_affected();

        if affected == 0 {
            return Err(AppError::NotFound(format!(
                "No user found with id {user_id}",
            )));
        }

        Ok(())
    }
}
