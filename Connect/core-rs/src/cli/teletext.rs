use anyhow::{Context, Result};
use std::fs;
use std::path::{Path, PathBuf};

pub fn convert(input: &Path, output: Option<&Path>) -> Result<PathBuf> {
    let source = fs::read_to_string(input)
        .with_context(|| format!("failed reading ascii file {}", input.display()))?;
    let codes = crate::teletext::ascii::convert_ascii_text_to_codes(&source);
    let out_path = output
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| input.with_extension("ttx"));
    let encoded = codes
        .iter()
        .map(|c| format!("{c:02X}"))
        .collect::<Vec<_>>()
        .join(" ");
    fs::write(&out_path, encoded).with_context(|| format!("failed writing {}", out_path.display()))?;
    Ok(out_path)
}

pub fn render(input: &Path, mode: &str) -> Result<String> {
    let raw = fs::read_to_string(input)
        .with_context(|| format!("failed reading teletext file {}", input.display()))?;
    let codes = parse_hex_codes(&raw)?;
    let body = crate::teletext::ascii::convert_codes_to_ascii(&codes);
    let label = mode.to_uppercase();
    let (start, end) = match mode {
        "teletext" => ("\x1b[40m\x1b[32m", "\x1b[0m"),
        "terminal" | "ansi" => ("", ""),
        _ => ("", ""),
    };
    Ok(format!("{start}== TELETEXT [{label}] ==\n{body}{end}"))
}

pub fn grid_render(input: &Path, output: Option<&Path>) -> Result<PathBuf> {
    let source = fs::read_to_string(input)
        .with_context(|| format!("failed reading grid source {}", input.display()))?;
    let codes = crate::teletext::grid::obf_like_grid_to_codes(&source);
    let out_path = output
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| input.with_extension("ttx"));
    let encoded = codes
        .iter()
        .map(|c| format!("{c:02X}"))
        .collect::<Vec<_>>()
        .join(" ");
    fs::write(&out_path, encoded).with_context(|| format!("failed writing {}", out_path.display()))?;
    Ok(out_path)
}

fn parse_hex_codes(input: &str) -> Result<Vec<u8>> {
    let mut out = Vec::new();
    for token in input.split_whitespace() {
        let code = u8::from_str_radix(token, 16)
            .with_context(|| format!("invalid teletext token `{token}`"))?;
        out.push(code);
    }
    Ok(out)
}
