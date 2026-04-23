use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatEntry {
    pub personality: String,
    pub prompt: String,
    pub response: String,
}

pub fn history_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(home).join(".cache/udos/chat/history.jsonl")
}

pub fn append(entry: &ChatEntry) -> Result<()> {
    let p = history_path();
    if let Some(parent) = p.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut f = OpenOptions::new().create(true).append(true).open(&p)?;
    writeln!(f, "{}", serde_json::to_string(entry)?)?;
    Ok(())
}

pub fn read_history() -> Result<Vec<ChatEntry>> {
    let p = history_path();
    if !p.exists() {
        return Ok(Vec::new());
    }
    let raw = fs::read_to_string(p)?;
    let mut items = Vec::new();
    for line in raw.lines() {
        if line.trim().is_empty() {
            continue;
        }
        if let Ok(item) = serde_json::from_str::<ChatEntry>(line) {
            items.push(item);
        }
    }
    Ok(items)
}
