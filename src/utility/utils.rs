pub fn some_text_or_none(text: String) -> Option<String> {
    if text.is_empty() {
        None
    } else {
        Some(text)
    }
}
