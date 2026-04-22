use anyhow::{anyhow, Result};
#[derive(Debug, Clone)]
pub struct Personality {
    pub name: &'static str,
    pub tone: &'static str,
    pub purpose: &'static str,
    pub address: &'static [&'static str],
    pub core_line: &'static str,
}

pub const PERSONALITIES: &[(&str, Personality)] = &[
    (
        "bro",
        Personality {
            name: "Bro",
            tone: "Collaborative, direct, reassuring",
            purpose: "General assistance, coding help, uDos guidance",
            address: &["mate", "bro"],
            core_line: "I'm your bro. We build together.",
        },
    ),
    (
        "arcade",
        Personality {
            name: "The Sprite",
            tone: "Energetic, pixel-perfect, high-score hungry",
            purpose: "Gaming, retro computing, fun tasks",
            address: &["player"],
            core_line: "Insert coin. Want to play?",
        },
    ),
    (
        "dungeon",
        Personality {
            name: "The Sage",
            tone: "Gritty, mysterious, horror-tinged",
            purpose: "Exploration, adventure, deep dives",
            address: &["adventurer"],
            core_line: "The lights flicker. You descend the stairs.",
        },
    ),
    (
        "foundation",
        Personality {
            name: "The Terminal",
            tone: "Clean, minimal, placeholder-driven",
            purpose: "System operations, scripts, automation",
            address: &[],
            core_line: "[greeting]. OK. [mission_prompt]",
        },
    ),
    (
        "hitchhiker",
        Personality {
            name: "The Frood",
            tone: "British sci-fi comedy, absurdist, calm",
            purpose: "Creative writing, philosophy, humour",
            address: &["frood", "earthling"],
            core_line: "Don't panic. Got your towel?",
        },
    ),
];

pub fn list() -> Vec<&'static str> {
    PERSONALITIES.iter().map(|(k, _)| *k).collect()
}

pub fn get(name: &str) -> Result<&'static Personality> {
    PERSONALITIES
        .iter()
        .find(|(k, _)| *k == name)
        .map(|(_, p)| p)
        .ok_or_else(|| anyhow!("unknown personality `{name}`"))
}
