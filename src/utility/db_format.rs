use chrono::{NaiveDate, NaiveDateTime};

pub const DATE_FORMAT: &str = "%Y-%m-%d";
pub const DATE_TIME_FORMAT: &str = "%Y-%m-%d %H:%M:%S";

pub fn parse_date(s: &str) -> Result<NaiveDate, chrono::ParseError> {
    NaiveDate::parse_from_str(s, DATE_FORMAT)
}

pub fn parse_date_time(s: &str) -> Result<NaiveDateTime, chrono::ParseError> {
    NaiveDateTime::parse_from_str(s, DATE_TIME_FORMAT)
}

pub fn format_date(d: &NaiveDate) -> String {
    d.format(DATE_FORMAT).to_string()
}

pub fn format_date_time(dt: &NaiveDateTime) -> String {
    dt.format(DATE_TIME_FORMAT).to_string()
}
