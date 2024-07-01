use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

use crate::utility::{
    db_extensions::Model,
    db_format::{format_date_time, parse_date_time},
};

#[derive(Debug, Clone)]
pub struct UserRaw {
    pub id: i64,
    pub username: String,
    pub monthly_goal: Option<f64>,
    pub created_at: String,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserModel {
    pub id: i64,
    pub username: String,
    pub monthly_goal: Option<f64>,
    pub created_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>,
}

impl Model<UserRaw> for UserModel {}

impl TryFrom<UserRaw> for UserModel {
    type Error = anyhow::Error;
    fn try_from(raw: UserRaw) -> Result<Self, Self::Error> {
        let created_at = parse_date_time(&raw.created_at)?;
        let deleted_at = raw.deleted_at.map(|s| parse_date_time(&s)).transpose()?;
        Ok(UserModel {
            id: raw.id,
            username: raw.username,
            monthly_goal: raw.monthly_goal,
            created_at,
            deleted_at,
        })
    }
}

impl From<UserModel> for UserRaw {
    fn from(model: UserModel) -> Self {
        let created_at = format_date_time(&model.created_at);
        let deleted_at = model.deleted_at.map(|dt| format_date_time(&dt));
        UserRaw {
            id: model.id,
            username: model.username,
            monthly_goal: model.monthly_goal,
            created_at,
            deleted_at,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPartial {
    pub username: String,
    pub monthly_goal: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct UserLogin {
    pub username: String,
}
