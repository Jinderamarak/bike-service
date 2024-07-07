use chrono::NaiveDateTime;
use serde::Serialize;
use uuid::Uuid;

use crate::utility::{
    db_extensions::Model,
    db_format::{format_date_time, parse_date_time},
};

#[derive(Debug, Clone)]
pub struct SessionRaw {
    pub id: String,
    pub token: String,
    pub user_id: i64,
    pub user_agent: String,
    pub created_at: String,
    pub last_used_at: String,
    pub revoked_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionModel {
    pub id: Uuid,
    pub token: String,
    pub user_id: i64,
    pub user_agent: String,
    pub created_at: NaiveDateTime,
    pub last_used_at: NaiveDateTime,
    pub revoked_at: Option<NaiveDateTime>,
}

impl Model<SessionRaw> for SessionModel {}

impl From<SessionModel> for SessionRaw {
    fn from(model: SessionModel) -> Self {
        let created_at = format_date_time(&model.created_at);
        let last_used_at = format_date_time(&model.last_used_at);
        let revoked_at = model.revoked_at.map(|dt| format_date_time(&dt));
        SessionRaw {
            id: model.id.to_string(),
            token: model.token,
            user_id: model.user_id,
            user_agent: model.user_agent,
            created_at,
            last_used_at,
            revoked_at,
        }
    }
}

impl TryFrom<SessionRaw> for SessionModel {
    type Error = anyhow::Error;
    fn try_from(raw: SessionRaw) -> Result<Self, Self::Error> {
        let id = Uuid::parse_str(&raw.id)?;
        let created_at = parse_date_time(&raw.created_at)?;
        let last_used_at = parse_date_time(&raw.last_used_at)?;
        let revoked_at = raw.revoked_at.map(|dt| parse_date_time(&dt)).transpose()?;
        Ok(SessionModel {
            id,
            token: raw.token,
            user_id: raw.user_id,
            user_agent: raw.user_agent,
            created_at,
            last_used_at,
            revoked_at,
        })
    }
}
