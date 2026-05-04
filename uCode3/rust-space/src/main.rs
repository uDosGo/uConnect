// RustSpace — 3D spatial computing environment for uDos (placeholder)
//
// Currently: egui window that reads tasks from Hivemind MCP server.
// Future: Bevy-based 3D world for spatial computing, code visualisation, and gaming.

use eframe::egui;
use serde::{Deserialize, Serialize};

// ─── Data Types ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Task {
    id: Option<String>,
    title: Option<String>,
    content: Option<String>,
    status: Option<String>,
    priority: Option<String>,
    column: Option<String>,
}

impl Task {
    fn display_title(&self) -> &str {
        self.title
            .as_deref()
            .or(self.content.as_deref())
            .unwrap_or("Untitled")
    }

    fn display_status(&self) -> &str {
        self.status
            .as_deref()
            .or(self.column.as_deref())
            .unwrap_or("unknown")
    }
}

// ─── MCP Client ───────────────────────────────────────────────────────────────

fn fetch_tasks() -> Vec<Task> {
    let client = reqwest::blocking::Client::new();
    let body = serde_json::json!({
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "list_tasks",
            "arguments": {}
        },
        "id": 1
    });

    match client
        .post("http://localhost:30000/mcp")
        .json(&body)
        .send()
    {
        Ok(resp) => {
            let data: serde_json::Value = match resp.json() {
                Ok(v) => v,
                Err(_) => return vec![],
            };
            let content = data["result"]["content"]
                .as_array()
                .and_then(|arr| arr.first())
                .and_then(|c| c["text"].as_str())
                .unwrap_or("[]");
            serde_json::from_str(content).unwrap_or_default()
        }
        Err(_) => vec![],
    }
}

fn fetch_health() -> String {
    let client = reqwest::blocking::Client::new();
    match client.get("http://localhost:30000/health").send() {
        Ok(resp) => match resp.json::<serde_json::Value>() {
            Ok(v) => v["status"].as_str().unwrap_or("unknown").to_string(),
            Err(_) => "error".to_string(),
        },
        Err(_) => "offline".to_string(),
    }
}

fn fetch_tools() -> Vec<String> {
    let client = reqwest::blocking::Client::new();
    let body = serde_json::json!({
        "jsonrpc": "2.0",
        "method": "tools/list",
        "id": 1
    });

    match client
        .post("http://localhost:30000/mcp")
        .json(&body)
        .send()
    {
        Ok(resp) => {
            let data: serde_json::Value = match resp.json() {
                Ok(v) => v,
                Err(_) => return vec![],
            };
            data["result"]["tools"]
                .as_array()
                .map(|arr| {
                    arr.iter()
                        .filter_map(|t| t["name"].as_str().map(String::from))
                        .collect()
                })
                .unwrap_or_default()
        }
        Err(_) => vec![],
    }
}

// ─── App ──────────────────────────────────────────────────────────────────────

struct RustSpaceApp {
    tasks: Vec<Task>,
    tools: Vec<String>,
    health: String,
    selected_task: usize,
    show_tools: bool,
    show_help: bool,
}

impl Default for RustSpaceApp {
    fn default() -> Self {
        let health = fetch_health();
        let tasks = if health == "ok" { fetch_tasks() } else { vec![] };
        let tools = if health == "ok" { fetch_tools() } else { vec![] };
        Self {
            tasks,
            tools,
            health,
            selected_task: 0,
            show_tools: false,
            show_help: false,
        }
    }
}

impl eframe::App for RustSpaceApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // ─── Top Panel ───────────────────────────────────────────────────────
        egui::TopBottomPanel::top("top_bar").show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.heading("🚀 RustSpace");
                ui.separator();

                // Connection status
                let (color, text) = match self.health.as_str() {
                    "ok" => (egui::Color32::GREEN, "🟢 MCP Connected"),
                    _ => (egui::Color32::RED, "🔴 MCP Offline"),
                };
                ui.colored_label(color, text);

                ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                    if ui.button("❓ Help").clicked() {
                        self.show_help = !self.show_help;
                    }
                    if ui.button("🔄 Refresh").clicked() {
                        self.health = fetch_health();
                        if self.health == "ok" {
                            self.tasks = fetch_tasks();
                            self.tools = fetch_tools();
                        }
                    }
                    if ui.button("🧰 Tools").clicked() {
                        self.show_tools = !self.show_tools;
                    }
                });
            });
        });

        // ─── Bottom Panel ────────────────────────────────────────────────────
        egui::TopBottomPanel::bottom("status_bar").show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label(format!(
                    "📋 {} tasks  |  🧰 {} tools  |  🖥️ localhost:30000",
                    self.tasks.len(),
                    self.tools.len(),
                ));
                ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                    ui.label("RustSpace v0.1.0 — Placeholder");
                });
            });
        });

        // ─── Central Panel ───────────────────────────────────────────────────
        egui::CentralPanel::default().show(ctx, |ui| {
            if self.show_help {
                self.render_help(ui);
                return;
            }

            if self.show_tools {
                self.render_tools(ui);
                return;
            }

            // Split: left = task list, right = detail
            egui::SidePanel::left("task_list")
                .resizable(true)
                .default_width(300.0)
                .show_inside(ui, |ui| {
                    ui.heading("📋 Tasks");
                    ui.separator();

                    if self.tasks.is_empty() {
                        ui.label("No tasks loaded. Click Refresh.");
                        return;
                    }

                    egui::ScrollArea::vertical().show(ui, |ui| {
                        for (i, task) in self.tasks.iter().enumerate() {
                            let status_icon = match task.display_status().to_lowercase().as_str() {
                                "done" | "completed" => "✅",
                                "in-progress" | "active" => "🔄",
                                "planning" | "todo" => "📋",
                                _ => "📌",
                            };
                            let label = format!(
                                "{} {} — {}",
                                status_icon,
                                task.display_title(),
                                task.id.as_deref().unwrap_or("?")
                            );

                            let selected = i == self.selected_task;
                            if ui
                                .selectable_label(selected, &label)
                                .clicked()
                            {
                                self.selected_task = i;
                            }
                        }
                    });
                });

            // Right: task detail
            egui::CentralPanel::default().show_inside(ui, |ui| {
                if self.tasks.is_empty() {
                    ui.heading("🌌 RustSpace");
                    ui.separator();
                    ui.label("Welcome to RustSpace — the future spatial computing environment for uDos.");
                    ui.label("");
                    ui.label("Currently showing tasks from the Hivemind MCP server.");
                    ui.label("3D rendering (Bevy) coming in a future release.");
                    ui.label("");
                    ui.colored_label(
                        egui::Color32::GRAY,
                        "Press 'r' or click Refresh to load tasks.",
                    );
                    return;
                }

                let task = &self.tasks[self.selected_task.min(self.tasks.len().saturating_sub(1))];
                ui.heading(format!("📄 {}", task.display_title()));
                ui.separator();

                egui::Grid::new("task_detail").num_columns(2).show(ui, |ui| {
                    ui.label("ID:");
                    ui.label(task.id.as_deref().unwrap_or("—"));
                    ui.end_row();

                    ui.label("Status:");
                    ui.label(task.display_status());
                    ui.end_row();

                    ui.label("Priority:");
                    ui.label(task.priority.as_deref().unwrap_or("—"));
                    ui.end_row();

                    ui.label("Content:");
                    ui.label(task.content.as_deref().unwrap_or("—"));
                    ui.end_row();
                });

                ui.separator();
                ui.label("Future: 3D visualisation, spatial code editing, and more.");
            });
        });
    }
}

impl RustSpaceApp {
    fn render_help(&mut self, ui: &mut egui::Ui) {
        ui.heading("❓ RustSpace Help");
        ui.separator();
        ui.label("RustSpace is the 3D spatial computing environment for uDos.");
        ui.label("");
        ui.label("Current features (placeholder):");
        ui.label("  • View tasks from Hivemind MCP server");
        ui.label("  • View available MCP tools");
        ui.label("  • Connection status monitoring");
        ui.label("");
        ui.label("Coming soon:");
        ui.label("  • Bevy-based 3D world rendering");
        ui.label("  • Spatial code visualisation");
        ui.label("  • Interactive data exploration");
        ui.label("  • Game-like UI for code and data");
        ui.label("");
        ui.label("Controls:");
        ui.label("  • Click Refresh to reload data");
        ui.label("  • Click Tools to see MCP tools");
        ui.label("  • Click Help to toggle this panel");
        ui.label("");
        if ui.button("← Back").clicked() {
            self.show_help = false;
        }
    }

    fn render_tools(&mut self, ui: &mut egui::Ui) {
        ui.heading("🧰 MCP Tools");
        ui.separator();

        if self.tools.is_empty() {
            ui.label("No tools available. Is the MCP server running?");
        } else {
            egui::ScrollArea::vertical().show(ui, |ui| {
                for tool in &self.tools {
                    ui.label(format!("• {}", tool));
                }
            });
        }

        ui.separator();
        if ui.button("← Back").clicked() {
            self.show_tools = false;
        }
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

fn main() -> Result<(), eframe::Error> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .init();

    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([1200.0, 800.0])
            .with_title("RustSpace — uDos Spatial Computing"),
        ..Default::default()
    };

    eframe::run_native(
        "RustSpace",
        options,
        Box::new(|_cc| Box::new(RustSpaceApp::default())),
    )
}
