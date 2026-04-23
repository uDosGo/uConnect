use anyhow::{anyhow, Context, Result};
use serde::Deserialize;
use serde_json::{json, Value};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Deserialize, Clone)]
struct MarkdownifyConfigRoot {
    markdownify: MarkdownifyConfig,
}

#[derive(Debug, Deserialize, Clone)]
struct MarkdownifyConfig {
    enabled: bool,
    server_path: String,
    uv_path: Option<String>,
    capabilities: Vec<String>,
}

pub fn status_json() -> Value {
    match load_config() {
        Ok((path, cfg)) => {
            let server_path = resolve_configured_path(&cfg.server_path, path.parent());
            let project_root = infer_project_root(&server_path);
            let markitdown_bin = markitdown_bin_path(&project_root);
            json!({
                "ok": true,
                "enabled": cfg.enabled,
                "config_path": path,
                "server_path": server_path,
                "project_root": project_root,
                "markitdown_bin": markitdown_bin,
                "markitdown_installed": Path::new(&markitdown_bin).exists(),
                "capabilities": cfg.capabilities,
                "uv_path": cfg.uv_path
            })
        }
        Err(e) => json!({
            "ok": false,
            "error": e.to_string()
        }),
    }
}

pub fn import_to_markdown(params: Value) -> Result<Value> {
    let input = params
        .get("input")
        .and_then(Value::as_str)
        .ok_or_else(|| anyhow!("missing required `input` string"))?;
    let output = params.get("output").and_then(Value::as_str);

    let (config_path, cfg) = load_config()?;
    if !cfg.enabled {
        return Err(anyhow!(
            "markdownify is disabled in {}",
            config_path.display()
        ));
    }

    let server_path = resolve_configured_path(&cfg.server_path, config_path.parent());
    let project_root = infer_project_root(&server_path);
    let markitdown_bin = markitdown_bin_path(&project_root);

    if !Path::new(&markitdown_bin).exists() {
        return Err(anyhow!(
            "markitdown executable not found at {} (run `{}/setup.sh` or create .venv with markitdown)",
            markitdown_bin,
            project_root.display()
        ));
    }

    let output_path = match output {
        Some(path) => PathBuf::from(path),
        None => default_output_path(input),
    };

    let cmd_out = Command::new(&markitdown_bin)
        .arg(input)
        .output()
        .with_context(|| format!("failed to execute {}", markitdown_bin))?;
    if !cmd_out.status.success() {
        let stderr = String::from_utf8_lossy(&cmd_out.stderr).trim().to_string();
        return Err(anyhow!("markitdown failed: {stderr}"));
    }

    let markdown = String::from_utf8_lossy(&cmd_out.stdout).to_string();
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&output_path, markdown)?;

    Ok(json!({
        "ok": true,
        "input": input,
        "output": output_path,
        "config_path": config_path,
        "server_path": server_path,
        "project_root": project_root
    }))
}

fn load_config() -> Result<(PathBuf, MarkdownifyConfig)> {
    let path = resolve_config_path()?;
    let content =
        fs::read_to_string(&path).with_context(|| format!("failed to read {}", path.display()))?;
    let parsed: MarkdownifyConfigRoot = serde_yaml::from_str(&content)
        .with_context(|| format!("failed to parse yaml {}", path.display()))?;
    Ok((path, parsed.markdownify))
}

fn resolve_config_path() -> Result<PathBuf> {
    if let Ok(path) = env::var("UDOS_MARKDOWNIFY_CONFIG") {
        return Ok(PathBuf::from(path));
    }
    let root = repo_root()?;
    let local_cfg = root.join(".local/markdownify-config.yaml");
    if local_cfg.exists() {
        return Ok(local_cfg);
    }
    let example = root.join("dev/tools/markdownify-config.yaml.example");
    if example.exists() {
        return Ok(example);
    }
    Err(anyhow!(
        "markdownify config not found (expected .local/markdownify-config.yaml or dev/tools/markdownify-config.yaml.example)"
    ))
}

fn repo_root() -> Result<PathBuf> {
    let mut current = env::current_dir()?;
    loop {
        if current.join("dev").exists() && current.join("docs").exists() {
            return Ok(current);
        }
        if !current.pop() {
            break;
        }
    }
    Err(anyhow!("unable to resolve repo root from current directory"))
}

fn resolve_path(raw: &str, base: Option<&Path>) -> PathBuf {
    let path = PathBuf::from(raw);
    if path.is_absolute() {
        return path;
    }
    if let Some(base_dir) = base {
        return base_dir.join(path);
    }
    path
}

fn resolve_configured_path(raw: &str, base: Option<&Path>) -> PathBuf {
    let from_base = resolve_path(raw, base);
    if from_base.exists() {
        return from_base;
    }
    if let Ok(root) = repo_root() {
        return root.join(raw.trim_start_matches("./"));
    }
    from_base
}

fn infer_project_root(server_path: &Path) -> PathBuf {
    // server_path usually points to <project>/dist/index.js
    server_path
        .parent()
        .and_then(Path::parent)
        .map(Path::to_path_buf)
        .unwrap_or_else(|| server_path.to_path_buf())
}

fn markitdown_bin_path(project_root: &Path) -> String {
    let bin = if cfg!(windows) {
        "Scripts/markitdown.exe"
    } else {
        "bin/markitdown"
    };
    project_root.join(".venv").join(bin).display().to_string()
}

fn default_output_path(input: &str) -> PathBuf {
    if input.starts_with("http://") || input.starts_with("https://") {
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        return PathBuf::from(format!("imported-{ts}.md"));
    }

    let input_path = PathBuf::from(input);
    let stem = input_path
        .file_stem()
        .and_then(|x| x.to_str())
        .unwrap_or("imported");
    let mut out = input_path.with_file_name(stem);
    out.set_extension("md");
    out
}
