use anyhow::{anyhow, Result};

const STYLES: [&str; 5] = [
    "mono_blueprint",
    "mono_botanical",
    "mono_chrome",
    "mono_teletext",
    "mono_editorial",
];

const FORBIDDEN_TERMS: [&str; 5] = [
    "grey lines",
    "semi-transparent",
    "opacity < 1.0",
    "anti-aliased",
    "anti alias",
];

pub fn styles() {
    for style in STYLES {
        println!("{style}");
    }
}

pub fn render(prompt: &str, style: &str, aspect: &str, size: &str) -> Result<()> {
    validate_style(style)?;
    validate_mono_prompt(prompt)?;

    println!("image.nanobanana render scaffold");
    println!("style={style}");
    println!("aspect={aspect}");
    println!("size={size}");
    println!(
        "status=A2-alpha-stub (wire upstream nano-banana-pro-mcp or uDos-native image service)"
    );
    Ok(())
}

fn validate_style(style: &str) -> Result<()> {
    if STYLES.contains(&style) {
        return Ok(());
    }
    Err(anyhow!(
        "invalid style `{style}` (expected one of: {})",
        STYLES.join(", ")
    ))
}

fn validate_mono_prompt(prompt: &str) -> Result<()> {
    let lowered = prompt.to_ascii_lowercase();
    for term in FORBIDDEN_TERMS {
        if lowered.contains(term) {
            return Err(anyhow!(
                "prompt violates mono-core rule: contains forbidden term `{term}`"
            ));
        }
    }
    Ok(())
}
