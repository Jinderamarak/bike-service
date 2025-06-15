use std::fmt::{Debug, Formatter};
use std::net::{IpAddr, Ipv4Addr, SocketAddr};

use anyhow::Result;
use axum::http::HeaderValue;
use clap::Parser;
use tower_http::cors::{Any, CorsLayer};

const IPV4_ALL: IpAddr = IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0));

#[derive(Debug, Clone, Parser)]
#[command(author, version, about)]
pub struct Configuration {
    #[arg(
        short,
        long,
        env = "BIKE_ADDRESS",
        default_value_t = IPV4_ALL,
        help = "IP address for the server to listen on"
    )]
    pub address: IpAddr,
    #[arg(
        short,
        long,
        env = "BIKE_PORT",
        default_value_t = 8080,
        help = "Port for the server to listen on"
    )]
    pub port: u16,
    #[arg(
        short,
        long,
        env = "DATABASE_URL",
        default_value = "sqlite:./data.db?mode=rwc",
        help = "SQLite database url"
    )]
    pub database_url: String,
    #[arg(
        short,
        long,
        env = "BIKE_STATIC_DIR",
        default_value = "./static",
        help = "Directory to serve static files from"
    )]
    pub static_dir: String,
    #[arg(
        long,
        env = "BIKE_HOSTNAMES",
        help = "List of possible hostnames for frontend syncing",
        value_delimiter = ','
    )]
    pub hostnames: Vec<String>,
    #[arg(
        long,
        env = "BIKE_SESSION_MAX_INACTIVITY",
        default_value_t = 60 * 60 * 24 * 7 * 4, // 4 weeks
        help = "Maximum time in seconds for a session to be inactive before it is expired"
    )]
    pub session_max_inactivity: i64,
    #[arg(
        long,
        env = "BIKE_STRAVA_CLIENT_ID",
        help = "Strava client ID for OAuth"
    )]
    pub strava_client_id: Option<String>,
    #[arg(
        long,
        env = "BIKE_STRAVA_CLIENT_SECRET",
        help = "Strava client secret for OAuth"
    )]
    pub strava_client_secret: Option<SecretString>,
    #[arg(
        long,
        env = "BIKE_STRAVA_REDIRECT_ORIGIN",
        help = "Strava redirect origin for OAuth"
    )]
    pub strava_redirect_origin: Option<String>,
}

impl Configuration {
    pub const fn socket_address(&self) -> SocketAddr {
        SocketAddr::new(self.address, self.port)
    }

    pub fn create_cors_layer(&self) -> Result<CorsLayer> {
        let layer = CorsLayer::new();
        if self.hostnames.is_empty() {
            return Ok(layer);
        }

        let origins = self
            .hostnames
            .iter()
            .map(|o| o.parse::<HeaderValue>())
            .collect::<Result<Vec<_>, _>>()?;
        Ok(CorsLayer::new().allow_methods(Any).allow_origin(origins))
    }

    pub fn strava_config(&self) -> Option<StravaConfig> {
        Some(StravaConfig {
            client_id: self.strava_client_id.clone()?,
            client_secret: self.strava_client_secret.clone()?.into(),
            redirect_origin: self.strava_redirect_origin.clone()?,
        })
    }
}

#[derive(Clone)]
pub struct StravaConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_origin: String,
}

impl StravaConfig {
    pub fn oauth_url(
        &self,
        redirect_path: impl AsRef<str>,
        scope: impl AsRef<str>,
        state: impl AsRef<str>,
    ) -> String {
        format!("https://www.strava.com/oauth/authorize?client_id={}&redirect_uri={}{}&response_type=code&scope={}&state={}",
            self.client_id,
            self.redirect_origin,
            redirect_path.as_ref(),
            scope.as_ref(),
            state.as_ref(),
        )
    }
}

#[derive(Clone)]
pub struct SecretString(String);

impl Debug for SecretString {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "#SECRET#")
    }
}

impl Into<String> for SecretString {
    fn into(self) -> String {
        self.0
    }
}

impl From<String> for SecretString {
    fn from(value: String) -> Self {
        SecretString(value)
    }
}
