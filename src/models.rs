use chrono::NaiveDateTime;
use serde::Deserialize;
use sqlx::{Error, FromRow, Row};
use sqlx::sqlite::SqliteRow;

#[derive(Debug)]
pub struct MileageModel {
    pub id: i64,
    pub timestamp: NaiveDateTime,
    pub distance: f64,
}

impl FromRow<'_, SqliteRow> for MileageModel {
    fn from_row(row: &'_ SqliteRow) -> Result<Self, Error> {
        let timestamp: String = row.try_get("timestamp")?;
        let timestamp = NaiveDateTime::parse_from_str(&timestamp, "%Y-%m-%d %H:%M:%S").unwrap();
        Ok(MileageModel {
            id: row.try_get("id")?,
            timestamp,
            distance: row.try_get("distance")?,
        })
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateMileage {
    pub distance: f64,
}

pub trait NaiveDateTimeExt {
    fn for_sqlite(&self) -> String;
}

impl NaiveDateTimeExt for NaiveDateTime {
    fn for_sqlite(&self) -> String {
        self.format("%Y-%m-%d %H:%M:%S").to_string()
    }
}
