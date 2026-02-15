use regex::Regex;
use std::sync::LazyLock;

static SCRIPT_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)<script[^>]*>[\s\S]*?</script>").unwrap()
});
static ON_ATTR_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"on\w+\s*=\s*["'][^"']*["']"#).unwrap()
});
static JS_URI_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"javascript:").unwrap()
});

pub fn sanitize_content(content: &str) -> String {
    let no_script = SCRIPT_RE.replace_all(content, "");
    let no_attrs = ON_ATTR_RE.replace_all(&no_script, "");
    let safe = JS_URI_RE.replace_all(&no_attrs, "");
    safe.trim().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_remove_script_tags() {
        let input = "Hello <script>alert('xss')</script> World";
        assert_eq!(sanitize_content(input), "Hello  World");
    }

    #[test]
    fn test_remove_event_handlers() {
        let input = r#"<div onclick="evil()">Safe content</div>"#;
        assert!(!sanitize_content(input).contains("onclick"));
    }

    #[test]
    fn test_remove_javascript_uri() {
        let input = "Click <a href='javascript:alert(1)'>here</a>";
        assert!(!sanitize_content(input).contains("javascript:"));
    }

    #[test]
    fn test_clean_content_unchanged() {
        let input = "Perfectly safe content with <b>bold</b> text.";
        assert_eq!(sanitize_content(input), input);
    }
}
