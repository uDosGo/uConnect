use anyhow::{anyhow, Context, Result};
use serde::Deserialize;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Deserialize)]
struct AdaptorDoc {
    name: String,
    version: i64,
    capabilities: Option<Vec<String>>,
}

pub fn create(name: &str, kind: &str, vault_path: Option<&Path>) -> Result<PathBuf> {
    let dir = adaptor_root(vault_path)?;
    fs::create_dir_all(&dir)?;
    let filename = sanitize_name(name);
    let path = dir.join(format!("{filename}.adaptor.yaml"));
    if path.exists() {
        return Err(anyhow!("adaptor already exists: {}", path.display()));
    }
    fs::write(&path, adaptor_template(name, kind))?;
    println!("Created adaptor {}", path.display());
    Ok(path)
}

pub fn list(vault_path: Option<&Path>) -> Result<Vec<PathBuf>> {
    let dir = adaptor_root(vault_path)?;
    if !dir.exists() {
        println!("No adaptor directory at {}", dir.display());
        return Ok(Vec::new());
    }
    let mut out = Vec::new();
    for entry in fs::read_dir(&dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_file()
            && path
                .file_name()
                .and_then(|x| x.to_str())
                .is_some_and(|n| n.ends_with(".adaptor.yaml"))
        {
            println!("{}", path.display());
            out.push(path);
        }
    }
    out.sort();
    Ok(out)
}

pub fn validate(path: &Path) -> Result<()> {
    let raw = fs::read_to_string(path)
        .with_context(|| format!("failed to read adaptor {}", path.display()))?;
    let doc: AdaptorDoc = serde_yaml::from_str(&raw)
        .with_context(|| format!("invalid adaptor yaml {}", path.display()))?;
    if doc.name.trim().is_empty() {
        return Err(anyhow!("adaptor `name` cannot be empty"));
    }
    if doc.version < 1 {
        return Err(anyhow!("adaptor `version` must be >= 1"));
    }
    if doc.capabilities.as_ref().is_some_and(|x| x.is_empty()) {
        return Err(anyhow!("adaptor `capabilities` cannot be empty when present"));
    }
    println!("Adaptor valid: {} (v{})", doc.name, doc.version);
    Ok(())
}

fn adaptor_root(vault_path: Option<&Path>) -> Result<PathBuf> {
    let root = match vault_path {
        Some(path) => path.to_path_buf(),
        None => {
            let home = env::var("HOME").context("HOME is not set")?;
            PathBuf::from(home).join("vault")
        }
    };
    Ok(root.join("@user/adaptors"))
}

fn sanitize_name(raw: &str) -> String {
    let mut out = String::new();
    for ch in raw.chars() {
        if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
            out.push(ch.to_ascii_lowercase());
        } else if ch.is_whitespace() {
            out.push('-');
        }
    }
    let trimmed = out.trim_matches('-').to_string();
    if trimmed.is_empty() {
        "adaptor".to_string()
    } else {
        trimmed
    }
}

fn adaptor_template(name: &str, kind: &str) -> String {
    format!(
        r#"name: {name}
version: 1
description: "{name} adaptor scaffold"
kind: {kind}

capabilities:
  - import

config:
  required: []
  optional: []

commands:
  - name: sync
    action: "describe sync behavior"
"#
    )
}
