//! Home Assistant bridge CLI for uCode3
//!
//! Usage:
//!   ha-bridge setup <url> <token>       Setup HA integration
//!   ha-bridge configure                  Configure HA integration
//!   ha-bridge status                     Show HA status
//!   ha-bridge info                       Show HA instance info
//!   ha-bridge embed <output.html>        Generate embed HTML file
//!   ha-bridge kiosk enable|disable       Enable/disable kiosk mode
//!   ha-bridge refresh <minutes>          Set refresh rate
//!   ha-bridge version                    Get HA version
//!   ha-bridge check                      Check HA connection

use anyhow::Result;
use clap::{Parser, Subcommand};
use homeassistant::{HAConfig, HABridge};
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "ha-bridge", about = "Home Assistant bridge for uCode3")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Setup Home Assistant integration
    Setup {
        /// Base URL of the HA instance
        url: String,
        /// Long-lived access token
        token: String,
    },
    /// Configure HA integration from saved config
    Configure,
    /// Show HA status
    Status,
    /// Show HA instance info
    Info,
    /// Generate embed HTML file
    Embed {
        /// Output HTML file path
        output: PathBuf,
    },
    /// Enable/disable kiosk mode
    Kiosk {
        /// enable or disable
        mode: String,
    },
    /// Set refresh rate in minutes
    Refresh {
        /// Refresh rate in minutes
        rate: u32,
    },
    /// Get HA version
    Version,
    /// Check HA connection
    Check,
}

fn get_config_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(home).join(".sonic").join("ha-config.json")
}

fn get_or_create_bridge() -> Result<HABridge> {
    let config_path = get_config_path();
    if config_path.exists() {
        HABridge::load_config(&config_path)
    } else {
        anyhow::bail!(
            "HA not configured. Run 'ha-bridge setup <url> <token>' first."
        );
    }
}

fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Setup { url, token } => {
            println!("Setting up Home Assistant integration with {}...", url);
            let config = HAConfig {
                base_url: url.clone(),
                api_token: token,
                ..Default::default()
            };
            let bridge = HABridge::new(config)?;
            let config_path = get_config_path();
            bridge.save_config(&config_path)?;
            println!("✓ Home Assistant integration configured for {}", url);
        }
        Commands::Configure => {
            let bridge = get_or_create_bridge()?;
            println!("✓ Home Assistant integration is configured");
            let status = bridge.get_status();
            println!("  URL: {}", status.base_url);
        }
        Commands::Status => {
            let bridge = get_or_create_bridge()?;
            let status = bridge.get_status();
            println!("Home Assistant Status:");
            println!("  Base URL: {}", status.base_url);
            println!("  Status: {}", status.status);
            println!("  Last Checked: {}", status.last_checked);
            println!("  Kiosk Mode: {}", status.kiosk_mode);
            println!("  Refresh Rate: {} minutes", status.refresh_rate);
        }
        Commands::Info => {
            let bridge = get_or_create_bridge()?;
            let info = bridge.get_info()?;
            println!("Home Assistant Information:");
            for (key, value) in info {
                println!("  {}: {}", key, value);
            }
        }
        Commands::Embed { output } => {
            let bridge = get_or_create_bridge()?;
            bridge.generate_embed(&output)?;
            println!("✓ Embed HTML file generated at {:?}", output);
        }
        Commands::Kiosk { mode } => {
            let mut bridge = get_or_create_bridge()?;
            match mode.as_str() {
                "enable" => {
                    bridge.set_kiosk_mode(true);
                    println!("✓ Kiosk mode enabled");
                }
                "disable" => {
                    bridge.set_kiosk_mode(false);
                    println!("✓ Kiosk mode disabled");
                }
                _ => anyhow::bail!("mode must be 'enable' or 'disable'"),
            }
            bridge.save_config(&get_config_path())?;
        }
        Commands::Refresh { rate } => {
            let mut bridge = get_or_create_bridge()?;
            bridge.set_refresh_rate(rate);
            bridge.save_config(&get_config_path())?;
            println!("✓ Refresh rate set to {} minutes", rate);
        }
        Commands::Version => {
            let bridge = get_or_create_bridge()?;
            let version = bridge.get_version()?;
            println!("Home Assistant Version: {}", version);
        }
        Commands::Check => {
            let bridge = get_or_create_bridge()?;
            println!("Checking Home Assistant connection...");
            match bridge.check_connection() {
                Ok(true) => println!("✅ Home Assistant is accessible"),
                Ok(false) => println!("❌ Home Assistant is not accessible"),
                Err(e) => println!("❌ Connection failed: {}", e),
            }
        }
    }

    Ok(())
}
