use std::string;

use axum::extract::multipart::MultipartError;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use csv::Writer;

pub type AppResult<T> = Result<T, AppError>;

pub enum AppError {
    NotFound(String),
    BadRequest(String),
    NotAuthenticated,
    NotAuthorized,
    Conflict(String),
    #[cfg_attr(not(debug_assertions), allow(dead_code))]
    Database(sqlx::Error),
    #[cfg_attr(not(debug_assertions), allow(dead_code))]
    Other(anyhow::Error),
}

impl AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::NotFound(_) => StatusCode::NOT_FOUND,
            AppError::BadRequest(_) => StatusCode::BAD_REQUEST,
            AppError::NotAuthenticated => StatusCode::BAD_REQUEST,
            AppError::NotAuthorized => StatusCode::UNAUTHORIZED,
            AppError::Conflict(_) => StatusCode::CONFLICT,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    #[cfg(debug_assertions)]
    fn message(&self) -> String {
        match self {
            AppError::NotFound(e) => format!("Not Found: {e}"),
            AppError::BadRequest(e) => format!("Bad Request: {e}"),
            AppError::NotAuthenticated => "Not Authenticated".to_string(),
            AppError::NotAuthorized => "Not Authorized".to_string(),
            AppError::Conflict(e) => format!("Conflict: {e}"),
            AppError::Database(e) => format!("Database Error: {e}"),
            AppError::Other(e) => format!("Internal Server Error: {e}"),
        }
    }

    #[cfg(not(debug_assertions))]
    fn message(&self) -> String {
        match self {
            AppError::NotFound(e) => format!("Not Found: {e}"),
            AppError::BadRequest(e) => format!("Bad Request: {e}"),
            AppError::NotAuthenticated => format!("Bad Request: Not Authenticated"),
            AppError::NotAuthorized => format!("Unauthorized"),
            AppError::Conflict(e) => format!("Conflict: {e}"),
            _ => "Internal Server Error".to_string(),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (self.status_code(), self.message()).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        AppError::Database(e)
    }
}

impl From<anyhow::Error> for AppError {
    fn from(e: anyhow::Error) -> Self {
        AppError::Other(e)
    }
}

impl From<csv::Error> for AppError {
    fn from(e: csv::Error) -> Self {
        AppError::Other(e.into())
    }
}

impl From<csv::IntoInnerError<Writer<Vec<u8>>>> for AppError {
    fn from(e: csv::IntoInnerError<Writer<Vec<u8>>>) -> Self {
        AppError::Other(e.into())
    }
}

impl From<string::FromUtf8Error> for AppError {
    fn from(e: string::FromUtf8Error) -> Self {
        AppError::Other(e.into())
    }
}

impl From<MultipartError> for AppError {
    fn from(e: MultipartError) -> Self {
        AppError::Other(e.into())
    }
}
