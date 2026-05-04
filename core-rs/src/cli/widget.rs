use anyhow::{anyhow, Context, Result};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

pub fn create(name: &str, lang: &str, vault_path: Option<&Path>) -> Result<PathBuf> {
    let widgets_dir = widget_root(vault_path)?;
    fs::create_dir_all(&widgets_dir)?;
    let ext = match lang.to_ascii_lowercase().as_str() {
        "js" | "javascript" => "js",
        "ts" | "typescript" => "ts",
        other => {
            return Err(anyhow!(
                "unsupported widget language `{other}` (expected js|ts)"
            ))
        }
    };

    let filename = sanitize_name(name);
    let widget_path = widgets_dir.join(format!("{filename}.{ext}"));
    if widget_path.exists() {
        return Err(anyhow!("widget already exists: {}", widget_path.display()));
    }
    fs::write(&widget_path, widget_template(name))?;
    println!("Created widget {}", widget_path.display());
    Ok(widget_path)
}

pub fn list(vault_path: Option<&Path>) -> Result<Vec<PathBuf>> {
    let widgets_dir = widget_root(vault_path)?;
    if !widgets_dir.exists() {
        println!("No widgets directory at {}", widgets_dir.display());
        return Ok(Vec::new());
    }
    let mut items = Vec::new();
    for entry in fs::read_dir(&widgets_dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let ext = path.extension().and_then(|x| x.to_str()).unwrap_or_default();
        if ext == "js" || ext == "ts" {
            println!("{}", path.display());
            items.push(path);
        }
    }
    items.sort();
    Ok(items)
}

pub fn test(widget: &Path) -> Result<()> {
    let source = fs::read_to_string(widget)
        .with_context(|| format!("failed to read widget {}", widget.display()))?;
    if !source.contains("onRender") {
        return Err(anyhow!(
            "widget {} is missing onRender contract",
            widget.display()
        ));
    }
    if !source.contains("return") {
        return Err(anyhow!(
            "widget {} has no return statement in source",
            widget.display()
        ));
    }
    println!("Widget test passed: {}", widget.display());
    Ok(())
}

fn widget_root(vault_path: Option<&Path>) -> Result<PathBuf> {
    let root = match vault_path {
        Some(path) => path.to_path_buf(),
        None => {
            let home = env::var("HOME").context("HOME is not set")?;
            PathBuf::from(home).join("vault")
        }
    };
    Ok(root.join("@toybox/widgets"))
}

fn sanitize_name(raw: &str) -> String {
    let mut out = String::new();
    for ch in raw.chars() {
        if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
            out.push(ch.to_ascii_lowercase());
        } else if ch.is_whitespace() {
            out.push('-');
        }
    }
    let trimmed = out.trim_matches('-').to_string();
    if trimmed.is_empty() {
        "widget".to_string()
    } else {
        trimmed
    }
}

fn widget_template(name: &str) -> String {
    format!(
        r#"// uDos widget scaffold
export default class {class_name} {{
  async onInit() {{
    this.title = "{title}";
    this.type = "card";
  }}

  async onRender() {{
    return `
      <card title="{title}">
        <text>Widget scaffold ready.</text>
      </card>
    `;
  }}

  async onAction(action) {{
    return action;
  }}
}}
"#,
        class_name = class_name(name),
        title = name
    )
}

fn class_name(name: &str) -> String {
    let mut out = String::new();
    for part in name.split(|c: char| !c.is_ascii_alphanumeric()) {
        if part.is_empty() {
            continue;
        }
        let mut chars = part.chars();
        if let Some(first) = chars.next() {
            out.push(first.to_ascii_uppercase());
            out.push_str(chars.as_str());
        }
    }
    if out.is_empty() {
        "WidgetScaffold".to_string()
    } else {
        format!("{out}Widget")
    }
}
