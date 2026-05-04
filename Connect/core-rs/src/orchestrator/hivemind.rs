use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderScore {
    pub provider: String,
    pub price: u8,
    pub speed: u8,
    pub relevance: u8,
    pub availability: u8,
    pub sovereignty: u8,
    pub context_window: u8,
}

pub fn rankings() -> Vec<ProviderScore> {
    vec![
        ProviderScore {
            provider: "ollama-local".to_string(),
            price: 100,
            speed: 70,
            relevance: 65,
            availability: 80,
            sovereignty: 100,
            context_window: 60,
        },
        ProviderScore {
            provider: "openrouter-cloud".to_string(),
            price: 45,
            speed: 80,
            relevance: 88,
            availability: 78,
            sovereignty: 25,
            context_window: 92,
        },
    ]
}

pub fn status() -> Vec<(&'static str, &'static str)> {
    vec![
        ("hivemind", "A2-stub"),
        ("openrouter", "A2-stub"),
        ("ollama", "A2-stub"),
    ]
}
