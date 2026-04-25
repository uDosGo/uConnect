// OK Helper - Example module for Registry demonstration

use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Intent {
    pub name: String,
    pub confidence: f32,
}

pub fn classify(text: &str) -> Option<Intent> {
    if text.contains("hello") || text.contains("hi") {
        Some(Intent {
            name: "greeting".to_string(),
            confidence: 0.95,
        })
    } else if text.contains("help") {
        Some(Intent {
            name: "assistance".to_string(),
            confidence: 0.85,
        })
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greeting() {
        let result = classify("hello world");
        assert!(result.is_some());
        assert_eq!(result.unwrap().name, "greeting");
    }

    #[test]
    fn test_help() {
        let result = classify("I need help");
        assert!(result.is_some());
        assert_eq!(result.unwrap().name, "assistance");
    }

    #[test]
    fn test_unknown() {
        let result = classify("random text");
        assert!(result.is_none());
    }
}