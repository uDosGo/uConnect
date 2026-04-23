use anyhow::Result;
use std::io::Write;
use std::process::Command;

use crate::teletext::ascii::convert_ascii_text_to_codes;

/// Print a FIGlet banner, or a boxed fallback if `figlet` is missing / fails.
pub fn banner(text: &str, font: &str, to_teletext: bool) -> Result<()> {
    match Command::new("figlet")
        .arg("-f")
        .arg(font)
        .arg(text)
        .output()
    {
        Ok(out) if out.status.success() => {
            let s = String::from_utf8_lossy(&out.stdout).to_string();
            if to_teletext {
                emit_teletext_hex(&s);
            } else {
                print!("{s}");
                let _ = std::io::stdout().flush();
            }
            Ok(())
        }
        Ok(out) => {
            let err = String::from_utf8_lossy(&out.stderr);
            if !err.trim().is_empty() {
                eprintln!("figlet: {err}");
            }
            print_fallback(text, to_teletext)?;
            Ok(())
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            eprintln!(
                "figlet not found on PATH. Install (e.g. `brew install figlet`) or set FIGLET_FONTDIR for fonts."
            );
            print_fallback(text, to_teletext)?;
            Ok(())
        }
        Err(e) => Err(e.into()),
    }
}

fn print_fallback(text: &str, to_teletext: bool) -> Result<()> {
    let fb = fallback_boxed_string(text);
    if to_teletext {
        emit_teletext_hex(&fb);
    } else {
        print!("{fb}");
    }
    Ok(())
}

fn emit_teletext_hex(banner: &str) {
    for line in banner.lines() {
        let codes = convert_ascii_text_to_codes(line);
        let hex = codes
            .iter()
            .map(|c| format!("{c:02X}"))
            .collect::<Vec<_>>()
            .join(" ");
        println!("{hex}");
    }
}

fn fallback_boxed_string(text: &str) -> String {
    let inner = format!(" {text} ");
    let w = inner.chars().count();
    let top = "=".repeat(w + 2);
    format!("{top}\n|{inner}|\n{top}\n")
}

/// List fonts: `showfigfonts`, else `figlet -I2` font dir, else A1 stub message.
pub fn fonts_list() -> Result<()> {
    if let Ok(out) = Command::new("showfigfonts").output() {
        if out.status.success() && !out.stdout.is_empty() {
            print!("{}", String::from_utf8_lossy(&out.stdout));
            return Ok(());
        }
    }
    if let Ok(out) = Command::new("figlet").arg("-I2").output() {
        if out.status.success() {
            let dir = String::from_utf8_lossy(&out.stdout);
            println!("FIGlet font directory (figlet -I2):\n{dir}");
            return Ok(());
        }
    }
    println!("No font list available (install `figlet`; optional `showfigfonts`).");
    println!("Place `.flf` files in FIGLET_FONTDIR or the system figlet fonts directory.");
    Ok(())
}

/// A1 stub: document manual install; no network/package manager automation.
pub fn fonts_install(name: &str) -> Result<()> {
    println!("A1 stub: copy `{name}.flf` into FIGLET_FONTDIR or your figlet fonts path; then `udo ascii fonts list`.");
    Ok(())
}

pub fn fonts_preview(font: &str, text: &str) -> Result<()> {
    banner(text, font, false)
}
