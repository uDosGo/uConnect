use anyhow::Result;
use std::path::Path;

pub fn export_obf_to_xp(obf: &str, path: &Path) -> Result<()> {
    let mut bytes = Vec::new();
    bytes.extend_from_slice(b"REXPAINT-STUB\n");
    bytes.extend_from_slice(obf.as_bytes());
    std::fs::write(path, bytes)?;
    Ok(())
}
