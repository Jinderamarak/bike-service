use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

pub type AppResult<T> = Result<T, AppError>;

pub enum AppError {
    Database(sqlx::Error),
    Templating(askama::Error),
    Other(anyhow::Error),
}

impl AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    #[cfg(debug_assertions)]
    fn message(&self) -> String {
        match self {
            AppError::Database(e) => format!("Database Error: {}", e),
            AppError::Templating(e) => format!("Templating Error: {}", e),
            AppError::Other(e) => format!("Internal Server Error: {}", e),
        }
    }

    #[cfg(not(debug_assertions))]
    fn message(&self) -> String {
        match self {
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

impl From<askama::Error> for AppError {
    fn from(e: askama::Error) -> Self {
        AppError::Templating(e)
    }
}

impl From<anyhow::Error> for AppError {
    fn from(e: anyhow::Error) -> Self {
        AppError::Other(e)
    }
}
