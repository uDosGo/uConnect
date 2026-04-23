use anyhow::Result;
use std::fs;
use std::path::Path;

pub fn import_xp_to_obf(path: &Path) -> Result<String> {
    let bytes = fs::read(path)?;
    let mut out = String::new();
    out.push_str("; OBF generated from REXPaint\n");
    out.push_str(&format!("; source: {}\n", path.display()));
    out.push_str(&format!("META bytes={}\n\n", bytes.len()));
    out.push_str("CARD title=\"Imported Grid\"\n");
    out.push_str("TEXT \"REXPaint payload imported\"\n");
    Ok(out)
}
