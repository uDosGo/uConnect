// CEETEX Integration Module
// Provides interface to the vendorized CEETEX teletext system

use std::process::Command;
use std::path::PathBuf;
use std::env;

/// Run CEETEX with the given page code
pub fn run_ceetex(page_code: &str) -> std::io::Result<String> {
    let ceetex_path = get_ceetex_path()?;
    
    let output = Command::new("python3")
        .arg(ceetex_path)
        .arg(page_code)
        .output()?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    } else {
        Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("CEETEX failed: {}", String::from_utf8_lossy(&output.stderr))
        ))
    }
}

/// Get the path to the CEETEX Python script
fn get_ceetex_path() -> std::io::Result<PathBuf> {
    // First try to find it relative to the workspace
    let workspace_root = env::var("CARGO_MANIFEST_DIR").unwrap_or_else(|_| ".".to_string());
    let vendor_path = PathBuf::from(&workspace_root)
        .parent()
        .and_then(|p| p.parent())
        .map(|p| p.join("Vendor").join("CEETEX").join("ceetex.py"));
    
    if let Some(path) = vendor_path {
        if path.exists() {
            return Ok(path);
        }
    }
    
    // Fallback: try to find it in common locations
    let possible_paths = vec![
        PathBuf::from("../../Vendor/CEETEX/ceetex.py"),
        PathBuf::from("/Users/fredbook/Code/uDosGo/Vendor/CEETEX/ceetex.py"),
    ];
    
    for path in possible_paths {
        if path.exists() {
            return Ok(path);
        }
    }
    
    Err(std::io::Error::new(
        std::io::ErrorKind::NotFound,
        "CEETEX not found. Please ensure it's installed in Vendor/CEETEX/"
    ))
}

/// Get available CEETEX pages from pages.json
pub fn get_available_pages() -> Vec<(String, String)> {
    // This would parse the pages.json file
    // For now, return some common ones
    vec![
        ("100".to_string(), "Index".to_string()),
        ("101".to_string(), "BBC News".to_string()),
        ("500".to_string(), "Hacker News".to_string()),
    ]
}

/// Check if CEETEX is available
pub fn is_ceetex_available() -> bool {
    get_ceetex_path().is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_ceetex_availability() {
        let available = is_ceetex_available();
        println!("CEETEX available: {}", available);
        assert!(available, "CEETEX should be available in Vendor/CEETEX/");
    }
}