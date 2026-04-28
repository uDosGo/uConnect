// Vault filesystem operations

use std::path::{PathBuf, Path};
use tokio::fs;
use serde_json::json;
use chrono::{DateTime, Local};

pub fn get_vault_root() -> PathBuf {
    std::env::var("UDOS_VAULT")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            let home = std::env::var("HOME").unwrap_or_else(|_| "/Users/fredbook".to_string());
            PathBuf::from(format!("{}/vault", home))
        })
}

fn resolve_path(vault_root: &Path, relative: &str) -> Result<PathBuf, String> {
    let full_path = vault_root.join(relative);
    let canonical_path = full_path.canonicalize()
        .map_err(|e| format!("Failed to canonicalize path: {}", e))?;
    
    // Security: ensure path is within vault root
    if !canonical_path.starts_with(vault_root) {
        return Err("Path outside vault root".to_string());
    }
    
    Ok(canonical_path)
}

pub async fn read_file(vault_root: &Path, relative_path: &str) -> Result<String, String> {
    let full_path = resolve_path(vault_root, relative_path)?;
    fs::read_to_string(&full_path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))
}

pub async fn write_file(vault_root: &Path, relative_path: &str, content: &str) -> Result<String, String> {
    let full_path = resolve_path(vault_root, relative_path)?;
    
    // Create parent directories if needed
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create directories: {}", e))?;
    }
    
    fs::write(&full_path, content)
        .await
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok("File written successfully".to_string())
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct VaultItem {
    pub name: String,
    pub is_directory: bool,
    pub size: Option<u64>,
    pub modified: Option<String>,
}

pub async fn list_dir(vault_root: &Path, relative_path: &str) -> Result<String, String> {
    let full_path = resolve_path(vault_root, relative_path)?;
    
    if !full_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    
    let mut entries = fs::read_dir(&full_path)
        .await
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    let mut items = Vec::new();
    
    while let Some(entry) = entries.next_entry().await.ok().flatten() {
        let metadata = entry.metadata().await.ok();
        let modified = metadata.as_ref().and_then(|m| m.modified().ok())
            .map(|t| {
                let datetime: DateTime<Local> = t.into();
                datetime.format("%Y-%m-%d %H:%M:%S").to_string()
            });
        
        items.push(VaultItem {
            name: entry.file_name().to_string_lossy().into_owned(),
            is_directory: metadata.as_ref().map(|m| m.is_dir()).unwrap_or(false),
            size: metadata.as_ref().map(|m| m.len()),
            modified,
        });
    }
    
    Ok(serde_json::to_string(&items).unwrap())
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct VaultSearchResult {
    pub path: String,
    pub name: String,
    pub score: f32,
    pub preview: String,
}

pub async fn search(vault_root: &Path, query: &str, relative_path: &str) -> Result<String, String> {
    let full_path = resolve_path(vault_root, relative_path)?;
    
    if !full_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    
    let query_lower = query.to_lowercase();
    let mut results = Vec::new();
    
    let mut entries = fs::read_dir(&full_path)
        .await
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    while let Some(entry) = entries.next_entry().await.ok().flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().into_owned();
        
        // Simple filename search
        if name.to_lowercase().contains(&query_lower) {
            let preview = if path.is_file() {
                fs::read_to_string(&path).await
                    .ok()
                    .and_then(|c| c.lines().next().map(|l| l.to_string()))
                    .unwrap_or_default()
            } else {
                String::new()
            };
            
            results.push(VaultSearchResult {
                path: path.to_string_lossy().into_owned(),
                name,
                score: 1.0, // Simple match score
                preview,
            });
        }
    }
    
    Ok(serde_json::to_string(&results).unwrap())
}

pub async fn delete_file(vault_root: &Path, relative_path: &str) -> Result<String, String> {
    let full_path = resolve_path(vault_root, relative_path)?;
    
    // Move to trash instead of permanent delete
    let trash_dir = vault_root.join(".trash");
    fs::create_dir_all(&trash_dir)
        .await
        .map_err(|e| format!("Failed to create trash directory: {}", e))?;
    
    let file_name = full_path.file_name().unwrap_or_else(|| std::ffi::OsStr::new("deleted_file"));
    let trash_path = trash_dir.join(file_name);
    
    fs::rename(&full_path, &trash_path)
        .await
        .map_err(|e| format!("Failed to move to trash: {}", e))?;
    
    Ok("File moved to trash".to_string())
}

pub async fn get_metadata(vault_root: &Path, relative_path: &str) -> Result<String, String> {
    let full_path = resolve_path(vault_root, relative_path)?;
    let metadata = fs::metadata(&full_path).await.ok();
    
    let created = metadata.as_ref().and_then(|m| m.created().ok())
        .map(|t| {
            let datetime: DateTime<Local> = t.into();
            datetime.format("%Y-%m-%d %H:%M:%S").to_string()
        });
    
    let modified = metadata.as_ref().and_then(|m| m.modified().ok())
        .map(|t| {
            let datetime: DateTime<Local> = t.into();
            datetime.format("%Y-%m-%d %H:%M:%S").to_string()
        });
    
    // TODO: Read tags from .tags file or similar
    let tags = Vec::<String>::new();
    
    let is_directory = metadata.as_ref().map(|m| m.is_dir()).unwrap_or(false);
    let size = metadata.as_ref().map(|m| m.len());
    
    Ok(json!({
        "path": relative_path,
        "exists": metadata.is_some(),
        "is_directory": is_directory,
        "size": size,
        "created": created,
        "modified": modified,
        "tags": tags
    }).to_string())
}
