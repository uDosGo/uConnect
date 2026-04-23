use anyhow::{anyhow, Context, Result};
use serde::{Deserialize, Serialize};
use std::env;
use std::fs::{self, OpenOptions};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub port: u16,
    pub a2_http_enabled: bool,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            port: 5678,
            a2_http_enabled: false,
        }
    }
}

pub fn config_path() -> Result<PathBuf> {
    let home = env::var("HOME").context("HOME is not set")?;
    Ok(PathBuf::from(home).join(".config/udos/server.yaml"))
}

pub fn state_dir() -> Result<PathBuf> {
    let home = env::var("HOME").context("HOME is not set")?;
    Ok(PathBuf::from(home).join(".cache/udos/server"))
}

fn pid_path() -> Result<PathBuf> {
    Ok(state_dir()?.join("server.pid"))
}

fn log_path() -> Result<PathBuf> {
    Ok(state_dir()?.join("server.log"))
}

pub fn load_config() -> Result<ServerConfig> {
    let p = config_path()?;
    if !p.exists() {
        return Ok(ServerConfig::default());
    }
    let raw = fs::read_to_string(&p)?;
    let cfg: ServerConfig = serde_yaml::from_str(&raw).unwrap_or_default();
    Ok(cfg)
}

pub fn start_background() -> Result<()> {
    let state = state_dir()?;
    fs::create_dir_all(&state)?;
    let log = log_path()?;
    let logf = OpenOptions::new().create(true).append(true).open(&log)?;
    let logf2 = logf.try_clone()?;
    let exe = env::current_exe()?;
    let child = Command::new(exe)
        .arg("__server-daemon")
        .stdout(Stdio::from(logf))
        .stderr(Stdio::from(logf2))
        .spawn()
        .context("failed to spawn uDosServer daemon")?;
    fs::write(pid_path()?, child.id().to_string())?;
    println!("uDosServer started (pid={})", child.id());
    Ok(())
}

pub fn stop_background() -> Result<()> {
    let pid_file = pid_path()?;
    if !pid_file.exists() {
        return Err(anyhow!("server pid file not found"));
    }
    let pid = fs::read_to_string(&pid_file)?.trim().to_string();
    let status = Command::new("kill").arg(pid.clone()).status()?;
    if !status.success() {
        return Err(anyhow!("failed to stop server pid={pid}"));
    }
    let _ = fs::remove_file(pid_file);
    println!("uDosServer stopped (pid={pid})");
    Ok(())
}

pub fn status_background() -> Result<()> {
    let pid_file = pid_path()?;
    if !pid_file.exists() {
        println!("uDosServer status: stopped");
        return Ok(());
    }
    let pid = fs::read_to_string(&pid_file)?.trim().to_string();
    let alive = Command::new("kill").arg("-0").arg(pid.clone()).status()?;
    if alive.success() {
        println!("uDosServer status: running (pid={pid})");
    } else {
        println!("uDosServer status: stale pid file (pid={pid})");
    }
    Ok(())
}

pub fn print_logs() -> Result<()> {
    let p = log_path()?;
    if !p.exists() {
        println!("no logs yet");
        return Ok(());
    }
    let out = fs::read_to_string(p)?;
    print!("{out}");
    Ok(())
}

pub async fn run_daemon_loop() -> Result<()> {
    fs::create_dir_all(state_dir()?)?;
    let cfg = load_config()?;
    println!(
        "uDosServer daemon boot: a2_http_enabled={}, port={}",
        cfg.a2_http_enabled, cfg.port
    );
    if cfg.a2_http_enabled {
        crate::mcp::server::UDosMcpServer::new()
            .run_http(cfg.port)
            .await
    } else {
        // A1 daemon mode is heartbeat-only; stdio MCP remains command-driven.
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(30)).await;
            println!("uDosServer heartbeat");
        }
    }
}

pub fn ensure_default_config() -> Result<()> {
    let p = config_path()?;
    if p.exists() {
        return Ok(());
    }
    if let Some(parent) = p.parent() {
        fs::create_dir_all(parent)?;
    }
    let default = ServerConfig::default();
    let yaml = serde_yaml::to_string(&default)?;
    fs::write(p, yaml)?;
    Ok(())
}

pub fn state_file_exists(path: &Path) -> bool {
    path.exists()
}
