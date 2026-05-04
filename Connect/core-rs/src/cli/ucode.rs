use anyhow::{Context, Result};
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

use crate::ucode::UCodeRuntime;

pub fn run_file(path: &Path) -> Result<()> {
    let code = fs::read_to_string(path).with_context(|| format!("read {}", path.display()))?;
    if is_markdown_path(path) {
        return run_markdown_source(&code, path);
    }
    run_source(&code)
}

pub fn run_eval(code: &str) -> Result<()> {
    run_source(code)
}

fn run_source(code: &str) -> Result<()> {
    let mut rt = UCodeRuntime::new();
    let source = strip_utf8_bom(code);
    let out = rt.execute(source)?;
    print!("{out}");
    Ok(())
}

fn run_markdown_source(markdown: &str, path: &Path) -> Result<()> {
    let blocks = extract_ucode_fences(markdown);
    if blocks.is_empty() {
        anyhow::bail!(
            "no ```ucode fences found in {} (use udo run --file <script.ucode> for plain files)",
            path.display()
        );
    }

    let mut rt = UCodeRuntime::new();
    let mut out = String::new();
    for block in blocks {
        out.push_str(&rt.execute(&block)?);
    }
    print!("{out}");
    Ok(())
}

fn is_markdown_path(path: &Path) -> bool {
    path.extension()
        .and_then(|x| x.to_str())
        .map(|ext| matches!(ext.to_ascii_lowercase().as_str(), "md" | "markdown"))
        .unwrap_or(false)
}

fn extract_ucode_fences(markdown: &str) -> Vec<String> {
    let mut blocks = Vec::new();
    let mut in_fence = false;
    let mut fence_char = '`';
    let mut fence_len = 0usize;
    let mut capture = false;
    let mut current = String::new();

    for line in markdown.lines() {
        let trimmed = line.trim_start();
        if !in_fence {
            if let Some((ch, len, rest)) = parse_fence_open(trimmed) {
                in_fence = true;
                fence_char = ch;
                fence_len = len;
                let info = rest.trim().to_ascii_lowercase();
                let lang = info
                    .split(|c: char| c.is_whitespace() || c == '{' || c == ',' || c == ':')
                    .next()
                    .unwrap_or_default();
                capture = lang == "ucode";
                current.clear();
            }
            continue;
        }

        if is_fence_close(trimmed, fence_char, fence_len) {
            if capture {
                blocks.push(current.clone());
            }
            in_fence = false;
            capture = false;
            current.clear();
            continue;
        }

        if capture {
            current.push_str(line);
            current.push('\n');
        }
    }

    blocks
}

fn strip_utf8_bom(input: &str) -> &str {
    input.strip_prefix('\u{feff}').unwrap_or(input)
}

fn parse_fence_open(line: &str) -> Option<(char, usize, &str)> {
    let first = line.chars().next()?;
    if first != '`' && first != '~' {
        return None;
    }
    let len = line.chars().take_while(|c| *c == first).count();
    if len < 3 {
        return None;
    }
    Some((first, len, &line[len..]))
}

fn is_fence_close(line: &str, fence_char: char, min_len: usize) -> bool {
    let len = line.chars().take_while(|c| *c == fence_char).count();
    if len < min_len {
        return false;
    }
    line[len..].trim().is_empty()
}

pub fn fmt_path(path: &Path, check: bool) -> Result<()> {
    if path.is_file() {
        return fmt_one_file(path, check);
    }
    if path.is_dir() {
        let mut count = 0usize;
        for entry in WalkDir::new(path).min_depth(1).max_depth(8) {
            let entry = entry?;
            let p = entry.path();
            if p.is_file() && p.extension().is_some_and(|e| e == "ucode") {
                fmt_one_file(p, check)?;
                count += 1;
            }
        }
        if count == 0 {
            println!("fmt: no .ucode files under {}", path.display());
        }
        return Ok(());
    }
    anyhow::bail!("not found: {}", path.display())
}

fn fmt_one_file(path: &Path, check: bool) -> Result<()> {
    let original =
        fs::read_to_string(path).with_context(|| format!("read {}", path.display()))?;
    let formatted = normalize_ucode(&original);
    if check {
        if original != formatted {
            anyhow::bail!("would reformat: {}", path.display());
        }
        return Ok(());
    }
    if original != formatted {
        fs::write(path, &formatted).with_context(|| format!("write {}", path.display()))?;
        println!("formatted {}", path.display());
    }
    Ok(())
}

fn normalize_ucode(input: &str) -> String {
    let lines: Vec<&str> = input.lines().collect();
    let trimmed: Vec<String> = lines.iter().map(|l| l.trim_end().to_string()).collect();
    let mut out = trimmed.join("\n");
    if !out.is_empty() && !out.ends_with('\n') {
        out.push('\n');
    } else if out.is_empty() {
        return String::new();
    }
    out
}
