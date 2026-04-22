use anyhow::{Context, Result};
use std::fs;
use std::path::{Path, PathBuf};

pub fn import_xp(input: &Path, output: Option<&Path>) -> Result<PathBuf> {
    let obf = crate::rexpaint::importer::import_xp_to_obf(input)?;
    let out_path = output
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| input.with_extension("obf"));
    fs::write(&out_path, obf).with_context(|| format!("failed writing {}", out_path.display()))?;
    Ok(out_path)
}

pub fn export_obf_to_xp(input: &Path, output: Option<&Path>) -> Result<PathBuf> {
    let obf = fs::read_to_string(input)
        .with_context(|| format!("failed reading {}", input.display()))?;
    let out_path = output
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| input.with_extension("xp"));
    crate::rexpaint::exporter::export_obf_to_xp(&obf, &out_path)?;
    Ok(out_path)
}
