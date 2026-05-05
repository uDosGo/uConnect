//! Home Assistant bridge for uCode3
//!
//! REST API client for Home Assistant instances.
//! Supports: status checks, entity queries, kiosk mode, embed generation,
//! and Matter protocol connector scaffolding.

use anyhow::{Context, Result};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::time::Duration;

/// Configuration for the Home Assistant bridge
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HAConfig {
    /// Base URL of the Home Assistant instance (e.g. http://homeassistant.local:8123)
    pub base_url: String,
    /// Long-lived access token
    pub api_token: String,
    /// Whether kiosk mode is enabled
    pub kiosk_mode: bool,
    /// Refresh rate in minutes
    pub refresh_rate: u32,
}

impl Default for HAConfig {
    fn default() -> Self {
        Self {
            base_url: String::new(),
            api_token: String::new(),
            kiosk_mode: false,
            refresh_rate: 5,
        }
    }
}

/// Status information about the HA integration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HAStatus {
    pub base_url: String,
    pub status: String,
    pub last_checked: String,
    pub kiosk_mode: bool,
    pub refresh_rate: u32,
}

/// Home Assistant bridge client
pub struct HABridge {
    config: HAConfig,
    client: Client,
}

impl HABridge {
    /// Create a new Home Assistant bridge
    pub fn new(config: HAConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .user_agent("uCode3-HA-Bridge/0.1.0")
            .default_headers({
                let mut headers = reqwest::header::HeaderMap::new();
                headers.insert(
                    reqwest::header::AUTHORIZATION,
                    format!("Bearer {}", config.api_token)
                        .parse()
                        .context("Invalid API token format")?,
                );
                headers.insert(
                    reqwest::header::CONTENT_TYPE,
                    "application/json".parse().unwrap(),
                );
                headers
            })
            .build()
            .context("Failed to create HTTP client")?;

        Ok(Self { config, client })
    }

    /// Check if the Home Assistant instance is accessible
    pub fn check_connection(&self) -> Result<bool> {
        let url = format!("{}/api/", self.config.base_url);
        let resp = self
            .client
            .get(&url)
            .send()
            .context("Failed to connect to Home Assistant")?;
        Ok(resp.status().is_success())
    }

    /// Get Home Assistant version info
    pub fn get_version(&self) -> Result<String> {
        let url = format!("{}/api/config", self.config.base_url);
        let resp = self
            .client
            .get(&url)
            .send()
            .context("Failed to get HA config")?;
        let config: serde_json::Value = resp
            .json()
            .context("Failed to parse HA config response")?;
        Ok(config["version"]
            .as_str()
            .unwrap_or("unknown")
            .to_string())
    }

    /// Get detailed information about the HA instance
    pub fn get_info(&self) -> Result<HashMap<String, serde_json::Value>> {
        let url = format!("{}/api/config", self.config.base_url);
        let resp = self
            .client
            .get(&url)
            .send()
            .context("Failed to get HA info")?;
        let config: HashMap<String, serde_json::Value> = resp
            .json()
            .context("Failed to parse HA info response")?;
        Ok(config)
    }

    /// Get the current status of the bridge
    pub fn get_status(&self) -> HAStatus {
        HAStatus {
            base_url: self.config.base_url.clone(),
            status: "configured".to_string(),
            last_checked: chrono_now(),
            kiosk_mode: self.config.kiosk_mode,
            refresh_rate: self.config.refresh_rate,
        }
    }

    /// Set kiosk mode
    pub fn set_kiosk_mode(&mut self, enabled: bool) {
        self.config.kiosk_mode = enabled;
    }

    /// Set refresh rate in minutes
    pub fn set_refresh_rate(&mut self, rate: u32) {
        self.config.refresh_rate = rate;
    }

    /// Generate an embed HTML file for the HA dashboard
    pub fn generate_embed(&self, output_path: &Path) -> Result<()> {
        let html = format!(
            r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home Assistant - uCode3</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        html, body {{ width: 100%; height: 100%; overflow: hidden; }}
        iframe {{ width: 100%; height: 100%; border: none; }}
    </style>
</head>
<body>
    <iframe src="{base_url}" allow="camera; microphone; fullscreen"></iframe>
</body>
</html>"#,
            base_url = self.config.base_url
        );
        std::fs::write(output_path, html)
            .with_context(|| format!("Failed to write embed file to {:?}", output_path))?;
        Ok(())
    }

    /// Save configuration to a JSON file
    pub fn save_config(&self, path: &Path) -> Result<()> {
        let json = serde_json::to_string_pretty(&self.config)
            .context("Failed to serialize config")?;
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .context("Failed to create config directory")?;
        }
        std::fs::write(path, json)
            .with_context(|| format!("Failed to write config to {:?}", path))?;
        Ok(())
    }

    /// Load configuration from a JSON file
    pub fn load_config(path: &Path) -> Result<Self> {
        let content = std::fs::read_to_string(path)
            .with_context(|| format!("Failed to read config from {:?}", path))?;
        let config: HAConfig = serde_json::from_str(&content)
            .context("Failed to parse config")?;
        Self::new(config)
    }
}

fn chrono_now() -> String {
    // Simple timestamp without chrono dependency
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    let secs = duration.as_secs();
    let (year, month, day, hour, min, sec) = timestamp_to_ymdhms(secs);
    format!("{}-{:02}-{:02} {:02}:{:02}:{:02}", year, month, day, hour, min, sec)
}

fn timestamp_to_ymdhms(secs: u64) -> (u64, u64, u64, u64, u64, u64) {
    // Days since epoch
    let days = secs / 86400;
    let time_secs = secs % 86400;
    let hour = time_secs / 3600;
    let min = (time_secs % 3600) / 60;
    let sec = time_secs % 60;

    // Year calculation (simplified, valid 1970-2099)
    let mut y = 1970u64;
    let mut remaining = days;
    loop {
        let days_in_year = if is_leap(y) { 366 } else { 365 };
        if remaining < days_in_year {
            break;
        }
        remaining -= days_in_year;
        y += 1;
    }

    let month_days = if is_leap(y) {
        [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    } else {
        [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    };

    let mut m = 0u64;
    for (i, &md) in month_days.iter().enumerate() {
        if remaining < md {
            m = i as u64 + 1;
            break;
        }
        remaining -= md;
    }
    if m == 0 {
        m = 12;
    }

    (y, m, remaining + 1, hour, min, sec)
}

fn is_leap(year: u64) -> bool {
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_timestamp_conversion() {
        // 2024-01-15 10:30:00 UTC = 1705314600
        let (y, m, d, h, min, s) = timestamp_to_ymdhms(1705314600);
        assert_eq!(y, 2024);
        assert_eq!(m, 1);
        assert_eq!(d, 15);
        assert_eq!(h, 10);
        assert_eq!(min, 30);
        assert_eq!(s, 0);
    }

    #[test]
    fn test_default_config() {
        let config = HAConfig::default();
        assert!(!config.kiosk_mode);
        assert_eq!(config.refresh_rate, 5);
    }

    #[test]
    fn test_serialize_deserialize() {
        let config = HAConfig {
            base_url: "http://localhost:8123".to_string(),
            api_token: "test-token".to_string(),
            kiosk_mode: true,
            refresh_rate: 10,
        };
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: HAConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.base_url, "http://localhost:8123");
        assert!(deserialized.kiosk_mode);
        assert_eq!(deserialized.refresh_rate, 10);
    }
}
