use clap::Parser;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};

const IPV4_ALL: IpAddr = IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0));

#[derive(Debug, Parser)]
#[command(author, version, about)]
pub struct Configuration {
    #[arg(short, long, env = "BIKE_ADDRESS", default_value_t = IPV4_ALL, help = "IP address for the server to listen on")]
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
}

impl Configuration {
    #[inline]
    pub fn socket_address(&self) -> SocketAddr {
        SocketAddr::new(self.address, self.port)
    }
}
