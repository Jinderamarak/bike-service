use axum::http::{header, HeaderMap};
use chrono::Utc;
use rand::RngCore;
use uuid::Uuid;

use super::models::SessionModel;

pub fn create_session(user_id: i64, headers: &HeaderMap) -> SessionModel {
    let id = Uuid::new_v4();
    let token = create_token();
    let user_agent = get_user_agent(headers);
    let now = Utc::now().naive_utc();

    SessionModel {
        id,
        token,
        user_id,
        user_agent,
        created_at: now,
        last_used_at: now,
        revoked_at: None,
    }
}

fn create_token() -> String {
    let mut token = [0u8; 64].to_vec();
    rand::thread_rng().fill_bytes(&mut token);
    hex::encode(token)
}

fn get_user_agent(headers: &HeaderMap) -> String {
    headers
        .get(header::USER_AGENT)
        .map(|v| v.to_str().unwrap_or_default())
        .unwrap_or_default()
        .to_string()
}
