//! Sensitive content detection
//! Ported from lib/ai/hybrid-router.ts

use regex::Regex;
use std::sync::LazyLock;

const SENSITIVITY_KEYWORDS: &[&str] = &["quantization","finetuning","offline ai","edgeai","cloud computing","crypto","blockchain","legal","privacy","deep research",];

static API_WORD_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"\bapi\b|\bapis\b").unwrap()
});

/// Check if text contains sensitive topics requiring higher-tier models.
pub fn is_sensitive(text: &str) -> bool {
    let lower = text.to_lowercase();
    // Check word-boundary match for "api"
    if API_WORD_RE.is_match(&lower) {
        return true;
    }
    // Check substring matches for other keywords
    SENSITIVITY_KEYWORDS.iter().any(|kw| lower.contains(kw))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sensitive_crypto() {
        assert!(is_sensitive("Tell me about blockchain development"));
    }

    #[test]
    fn test_sensitive_privacy() {
        assert!(is_sensitive("What are the privacy implications?"));
    }

    #[test]
    fn test_not_sensitive() {
        assert!(!is_sensitive("How do I build a feed in Rust?"));
    }

    #[test]
    fn test_api_false_positive() {
        assert!(!is_sensitive("The capital of Senegal"));
        assert!(!is_sensitive("What is the rapid way to do this?"));
        assert!(!is_sensitive("I need capability to handle this"));
    }

    #[test]
    fn test_api_true_positive() {
        assert!(is_sensitive("How do I use the API?"));
        assert!(is_sensitive("Tell me about REST APIs"));
    }
}