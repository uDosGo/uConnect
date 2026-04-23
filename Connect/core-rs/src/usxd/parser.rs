use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct USXDRegion {
    pub title: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct USXDSurface {
    pub name: String,
    pub regions: Vec<USXDRegion>,
}

pub fn parse_surface(path: &Path) -> Result<USXDSurface> {
    let raw = fs::read_to_string(path)?;
    let ext = path.extension().and_then(|x| x.to_str()).unwrap_or("");
    if ext.eq_ignore_ascii_case("yaml") || ext.eq_ignore_ascii_case("yml") {
        Ok(serde_yaml::from_str(&raw)?)
    } else {
        Ok(serde_json::from_str(&raw)?)
    }
}
