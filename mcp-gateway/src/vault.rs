// Vault Operations
// Direct filesystem operations for vault management

use serde_json::Value;
use std::path::{Path, PathBuf};
use std::fs;
use std::env;

fn get_vault_root() -> PathBuf {
    env::var("UDOS_VAULT")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            let home = env::var("HOME").unwrap_or_else(|_| "/Users/fredbook".to_string());
            PathBuf::from(format!("{}/vault", home))
        })
}

fn secure_path(vault_root: &Path, path: &Path) -> Result<PathBuf, String> {
    let full_path = vault_root.join(path);
    let canonical_path = full_path.canonicalize()
        .map_err(|e| format!("Failed to canonicalize path: {}", e))?;
    
    if !canonical_path.starts_with(vault_root) {
        return Err("Path outside vault root".to_string());
    }
    
    Ok(canonical_path)
}

pub async fn read(args: &Value) -> Result<String, String> {
    let vault_root = get_vault_root();
    let path = args["path"].as_str().unwrap_or("");
    let full_path = secure_path(&vault_root, Path::new(path))?;
    
    fs::read_to_string(&full_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

pub async fn write(args: &Value) -> Result<String, String> {
    let vault_root = get_vault_root();
    let path = args["path"].as_str().unwrap_or("");
    let content = args["content"].as_str().unwrap_or("");
    let full_path = secure_path(&vault_root, Path::new(path))?;
    
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directories: {}", e))?;
    }
    
    fs::write(&full_path, content)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(format!("Successfully wrote to {}", path))
}

pub async fn list(args: &Value) -> Result<String, String> {
    let vault_root = get_vault_root();
    let path = args["path"].as_str().unwrap_or("");
    let full_path = secure_path(&vault_root, Path::new(path))?;
    
    if !full_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    
    let mut items = Vec::new();
    for entry in fs::read_dir(&full_path).map_err(|e| format!("Failed to read directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        items.push(entry.file_name().to_string_lossy().into_owned());
    }
    
    Ok(format!("Items in {}: {:?}", path, items))
}

pub async fn search(args: &Value) -> Result<String, String> {
    let vault_root = get_vault_root();
    let query = args["query"].as_str().unwrap_or("");
    let path = args["path"].as_str().unwrap_or("");
    let full_path = secure_path(&vault_root, Path::new(path))?;
    
    if !full_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    
    let mut results = Vec::new();
    for entry in fs::read_dir(&full_path).map_err(|e| format!("Failed to read directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.contains(query) {
            results.push(name);
        }
    }
    
    Ok(format!("Search results for '{}': {:?}", query, results))
}

pub async fn delete(args: &Value) -> Result<String, String> {
    let vault_root = get_vault_root();
    let path = args["path"].as_str().unwrap_or("");
    let full_path = secure_path(&vault_root, Path::new(path))?;
    
    // Move to trash instead of permanent delete
    let trash_path = vault_root.join(".trash").join(
        full_path.file_name().unwrap_or_else(|| std::ffi::OsStr::new("deleted_file"))
    );
    
    fs::create_dir_all(trash_path.parent().unwrap())
        .map_err(|e| format!("Failed to create trash directory: {}", e))?;
    
    fs::rename(&full_path, &trash_path)
        .map_err(|e| format!("Failed to move to trash: {}", e))?;
    
    Ok(format!("Moved {} to trash", path))
}

pub async fn metadata(args: &Value) -> Result<String, String> {
    let vault_root = get_vault_root();
    let path = args["path"].as_str().unwrap_or("");
    let full_path = secure_path(&vault_root, Path::new(path))?;
    
    let metadata = fs::metadata(&full_path).map_err(|e| format!("Failed to get metadata: {}", e))?;
    
    Ok(format!(
        "Metadata for {}: size={} bytes, is_dir={}",
        path,
        metadata.len(),
        metadata.is_dir()
    ))
}