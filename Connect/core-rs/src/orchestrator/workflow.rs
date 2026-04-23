use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowJob {
    pub name: String,
    pub schedule: String,
    pub task: String,
    pub priority: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WorkflowConfig {
    pub schedules: Vec<WorkflowJob>,
}

pub fn config_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(home).join(".config/udos/workflow.yaml")
}

pub fn load() -> Result<WorkflowConfig> {
    let p = config_path();
    if !p.exists() {
        return Ok(WorkflowConfig::default());
    }
    let raw = fs::read_to_string(p)?;
    Ok(serde_yaml::from_str(&raw).unwrap_or_default())
}

pub fn save(cfg: &WorkflowConfig) -> Result<()> {
    let p = config_path();
    if let Some(parent) = p.parent() {
        fs::create_dir_all(parent)?;
    }
    let raw = serde_yaml::to_string(cfg)?;
    fs::write(p, raw)?;
    Ok(())
}
