// ThinUI Tauri Backend — uCode2 Tauri app shell
// Serves notionish, milkdown, and theme surfaces with MCP integration

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize)]
struct SystemInfo {
    version: String,
    surface: String,
    vault_path: String,
    mcp_socket: String,
}

struct AppState {
    current_surface: Mutex<String>,
    vault_path: String,
}

#[tauri::command]
fn get_system_info(state: tauri::State<AppState>) -> SystemInfo {
    SystemInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        surface: state.current_surface.lock().unwrap().clone(),
        vault_path: state.vault_path.clone(),
        mcp_socket: format!(
            "{}/.local/share/udos/mcp/core.sock",
            std::env::var("HOME").unwrap_or_else(|_| "~".into())
        ),
    }
}

#[tauri::command]
fn switch_surface(surface: String, state: tauri::State<AppState>) -> Result<(), String> {
    let valid = [
        "notionish",
        "milkdown",
        "bbcbasic",
        "nesdash",
        "retro",
        "ceefax",
    ];
    if !valid.contains(&surface.as_str()) {
        return Err(format!("Unknown surface: {}. Valid: {:?}", surface, valid));
    }
    *state.current_surface.lock().unwrap() = surface;
    Ok(())
}

#[tauri::command]
fn get_vault_path(state: tauri::State<AppState>) -> String {
    state.vault_path.clone()
}

fn main() {
    let vault = std::env::var("UDOS_VAULT").unwrap_or_else(|_| {
        format!(
            "{}/Code/Vault",
            std::env::var("HOME").unwrap_or_else(|_| ".".into())
        )
    });

    tauri::Builder::default()
        .manage(AppState {
            current_surface: Mutex::new("notionish".into()),
            vault_path: vault,
        })
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            switch_surface,
            get_vault_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running ThinUI Tauri app");
}
