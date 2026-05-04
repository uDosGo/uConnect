use anyhow::{anyhow, Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use walkdir::WalkDir;

const COMPOST_INDEX: &str = "index.json";

#[derive(Debug, Serialize, Deserialize, Clone)]
struct CompostRecord {
    id: String,
    original_path: String,
    deleted_at_ms: u128,
}

fn resolve_vault_root(path: Option<&Path>) -> Result<PathBuf> {
    if let Some(p) = path {
        return Ok(p.to_path_buf());
    }
    let home = env::var("HOME").context("HOME is not set")?;
    Ok(PathBuf::from(home).join("vault"))
}

fn compost_dir(root: &Path) -> PathBuf {
    root.join(".compost")
}

fn compost_index_path(root: &Path) -> PathBuf {
    compost_dir(root).join(COMPOST_INDEX)
}

fn load_compost_index(root: &Path) -> Result<Vec<CompostRecord>> {
    let index_path = compost_index_path(root);
    if !index_path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(&index_path)?;
    if content.trim().is_empty() {
        return Ok(Vec::new());
    }
    let records = serde_json::from_str(&content)
        .with_context(|| format!("failed to parse {}", index_path.display()))?;
    Ok(records)
}

fn save_compost_index(root: &Path, records: &[CompostRecord]) -> Result<()> {
    let index_path = compost_index_path(root);
    let json = serde_json::to_string_pretty(records)?;
    fs::write(index_path, json)?;
    Ok(())
}

fn infer_vault_root_from_target(target: &Path) -> Option<PathBuf> {
    let mut current = if target.is_dir() {
        target.to_path_buf()
    } else {
        target.parent()?.to_path_buf()
    };

    loop {
        if current.join(".compost").exists() {
            return Some(current);
        }
        if !current.pop() {
            break;
        }
    }

    None
}

pub fn init_vault(path: Option<&Path>) -> Result<()> {
    let root = resolve_vault_root(path)?;
    fs::create_dir_all(root.join("content"))?;
    fs::create_dir_all(root.join("ucode"))?;
    fs::create_dir_all(root.join(".compost"))?;
    fs::create_dir_all(root.join("system"))?;

    let config_path = root.join("config.md");
    if !config_path.exists() {
        let default_config = r#"# uDos Vault Config

- owner: local
- format: markdown
- compost: enabled
"#;
        fs::write(config_path, default_config)?;
    }

    let index_path = compost_index_path(&root);
    if !index_path.exists() {
        fs::write(index_path, "[]")?;
    }

    println!("Initialized vault at {}", root.display());
    Ok(())
}

pub fn list_vault(path: Option<&Path>, depth: Option<usize>) -> Result<()> {
    let root = resolve_vault_root(path)?;
    if !root.exists() {
        return Err(anyhow!(
            "vault does not exist at {} (run `udo init` first)",
            root.display()
        ));
    }

    let max_depth = depth.unwrap_or(3);
    for entry in WalkDir::new(&root)
        .max_depth(max_depth)
        .into_iter()
        .filter_map(Result::ok)
    {
        let p = entry.path();
        if p == root {
            continue;
        }
        let rel = p.strip_prefix(&root).unwrap_or(p);
        println!("{}", rel.display());
    }

    Ok(())
}

pub fn open_file(path: &Path) -> Result<()> {
    let editor = env::var("EDITOR").unwrap_or_else(|_| "vi".to_string());
    let status = Command::new(editor)
        .arg(path)
        .status()
        .with_context(|| format!("failed to open {}", path.display()))?;
    if !status.success() {
        return Err(anyhow!("editor exited with non-zero status"));
    }
    Ok(())
}

pub fn delete_file(path: &Path) -> Result<()> {
    if !path.exists() {
        return Err(anyhow!("path does not exist: {}", path.display()));
    }

    let root = infer_vault_root_from_target(path).ok_or_else(|| {
        anyhow!(
            "could not infer vault root from {} (missing .compost ancestor)",
            path.display()
        )
    })?;

    fs::create_dir_all(compost_dir(&root))?;
    let mut index = load_compost_index(&root)?;

    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .context("system clock is before unix epoch")?
        .as_millis();
    let id = format!("{now_ms}");
    let target = compost_dir(&root).join(&id);

    fs::rename(path, &target).with_context(|| {
        format!(
            "failed to move {} to compost {}",
            path.display(),
            target.display()
        )
    })?;

    let original_path = dunce::canonicalize(&root)
        .unwrap_or(root.clone())
        .join(path.strip_prefix(&root).unwrap_or(path))
        .display()
        .to_string();

    index.push(CompostRecord {
        id: id.clone(),
        original_path,
        deleted_at_ms: now_ms,
    });
    save_compost_index(&root, &index)?;

    println!("Deleted to compost id={id}");
    Ok(())
}

pub fn restore_file(vault_path: Option<&Path>, id: &str) -> Result<()> {
    let root = resolve_vault_root(vault_path)?;
    let compost_item = compost_dir(&root).join(id);
    if !compost_item.exists() {
        return Err(anyhow!("compost item not found: {}", compost_item.display()));
    }

    let mut index = load_compost_index(&root)?;
    let pos = index
        .iter()
        .position(|r| r.id == id)
        .ok_or_else(|| anyhow!("id not found in compost index: {id}"))?;
    let record = index[pos].clone();

    let restore_path = PathBuf::from(record.original_path);
    if let Some(parent) = restore_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::rename(&compost_item, &restore_path).with_context(|| {
        format!(
            "failed to restore {} to {}",
            compost_item.display(),
            restore_path.display()
        )
    })?;

    index.remove(pos);
    save_compost_index(&root, &index)?;
    println!("Restored {}", restore_path.display());
    Ok(())
}

pub fn search_vault(path: Option<&Path>, query: &str) -> Result<()> {
    let root = resolve_vault_root(path)?;
    if !root.exists() {
        return Err(anyhow!("vault does not exist at {}", root.display()));
    }

    let lowered = query.to_lowercase();
    let mut hits: BTreeMap<String, usize> = BTreeMap::new();

    for entry in WalkDir::new(&root).into_iter().filter_map(Result::ok) {
        let p = entry.path();
        if !p.is_file() || p.components().any(|c| c.as_os_str() == ".compost") {
            continue;
        }
        let Ok(content) = fs::read_to_string(p) else {
            continue;
        };
        let mut count = 0usize;
        for line in content.lines() {
            if line.to_lowercase().contains(&lowered) {
                count += 1;
            }
        }
        if count > 0 {
            let rel = p.strip_prefix(&root).unwrap_or(p).display().to_string();
            hits.insert(rel, count);
        }
    }

    for (file, count) in hits {
        println!("{file} ({count})");
    }
    Ok(())
}
