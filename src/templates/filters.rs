use std::fmt::Display;

pub fn removesuffix<T: Display>(s: T, suffix: &str) -> ::askama::Result<String> {
    let s = s.to_string();
    let trimmed = s.trim_end_matches(suffix).to_string();
    Ok(trimmed)
}
