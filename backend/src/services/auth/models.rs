use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

use crate::utility::{
    db_extensions::Model,
    db_format::{format_date_time, parse_date_time},
};

#[derive(Debug, Clone)]
pub struct SessionRaw {
    pub id: i64,
    pub user_id: i64,
    pub token: String,
    pub created_at: String,
    pub last_used_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionModel {
    pub id: i64,
    pub user_id: i64,
    pub token: String,
    pub created_at: NaiveDateTime,
    pub last_used_at: NaiveDateTime,
}

impl Model<SessionRaw> for SessionModel {}

impl From<SessionModel> for SessionRaw {
    fn from(model: SessionModel) -> Self {
        let created_at = format_date_time(&model.created_at);
        let last_used_at = format_date_time(&model.last_used_at);
        SessionRaw {
            id: model.id,
            user_id: model.user_id,
            token: model.token,
            created_at,
            last_used_at,
        }
    }
}

impl TryFrom<SessionRaw> for SessionModel {
    type Error = anyhow::Error;
    fn try_from(raw: SessionRaw) -> Result<Self, Self::Error> {
        let created_at = parse_date_time(&raw.created_at)?;
        let last_used_at = parse_date_time(&raw.last_used_at)?;
        Ok(SessionModel {
            id: raw.id,
            user_id: raw.user_id,
            token: raw.token,
            created_at,
            last_used_at,
        })
    }
}
