// System dashboard widgets for uCode2 TUI
// CPU, memory, vault stats, and component health

use ratatui::{
    prelude::*,
    style::{Color, Modifier, Style},
    widgets::{Block, Borders, Gauge, List, ListItem, Paragraph},
};
use std::time::Instant;

/// System metrics collected for the dashboard
#[derive(Debug, Clone)]
pub struct SystemMetrics {
    pub cpu_usage: f64,
    pub memory_usage: f64,
    pub vault_note_count: usize,
    pub snack_count: usize,
    pub mcp_connected: bool,
    pub uptime_seconds: u64,
    pub start_time: Instant,
}

impl SystemMetrics {
    pub fn new() -> Self {
        let now = Instant::now();
        SystemMetrics {
            cpu_usage: 0.0,
            memory_usage: 0.0,
            vault_note_count: 0,
            snack_count: 0,
            mcp_connected: false,
            uptime_seconds: 0,
            start_time: now,
        }
    }

    pub fn update(&mut self) {
        self.uptime_seconds = self.start_time.elapsed().as_secs();
    }
}

/// Render the system dashboard
pub fn render_dashboard(f: &mut Frame, area: Rect, metrics: &SystemMetrics) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints(
            [
                Constraint::Length(3), // Header
                Constraint::Length(3), // CPU gauge
                Constraint::Length(3), // Memory gauge
                Constraint::Min(1),    // Stats list
                Constraint::Length(3), // Footer
            ]
            .as_ref(),
        )
        .split(area);

    // Header
    let header = Paragraph::new("uCode2 System Dashboard")
        .block(Block::default().borders(Borders::ALL))
        .style(
            Style::default()
                .fg(Color::Yellow)
                .add_modifier(Modifier::BOLD),
        )
        .alignment(Alignment::Center);
    f.render_widget(header, chunks[0]);

    // CPU Gauge
    let cpu_gauge = Gauge::default()
        .block(Block::default().borders(Borders::ALL).title("CPU"))
        .gauge_style(Style::default().fg(Color::Cyan))
        .percent((metrics.cpu_usage * 100.0) as u16);
    f.render_widget(cpu_gauge, chunks[1]);

    // Memory Gauge
    let mem_gauge = Gauge::default()
        .block(Block::default().borders(Borders::ALL).title("Memory"))
        .gauge_style(Style::default().fg(Color::Green))
        .percent((metrics.memory_usage * 100.0) as u16);
    f.render_widget(mem_gauge, chunks[2]);

    // Stats
    let stats_items = vec![
        ListItem::new(format!("Vault Notes:   {}", metrics.vault_note_count)),
        ListItem::new(format!("Snacks:        {}", metrics.snack_count)),
        ListItem::new(format!(
            "MCP Status:    {}",
            if metrics.mcp_connected {
                "Connected"
            } else {
                "Disconnected"
            }
        )),
        ListItem::new(format!("Uptime:        {}s", metrics.uptime_seconds)),
    ];
    let stats_list = List::new(stats_items)
        .block(Block::default().borders(Borders::ALL).title("System Stats"))
        .style(Style::default().fg(Color::White));
    f.render_widget(stats_list, chunks[3]);

    // Footer
    let footer = Paragraph::new("q: Quit | Tab: Switch view | ?: Help")
        .block(Block::default().borders(Borders::ALL))
        .style(Style::default().fg(Color::DarkGray))
        .alignment(Alignment::Center);
    f.render_widget(footer, chunks[4]);
}

/// Theme color presets matching uCode1 themes
pub mod theme_colors {
    use ratatui::style::Color;

    pub const BBC_BASIC_BG: Color = Color::Rgb(0, 0, 128); // Classic blue
    pub const BBC_BASIC_FG: Color = Color::Rgb(0, 255, 255); // Cyan text
    pub const NES_RED: Color = Color::Rgb(215, 75, 53);
    pub const NES_BROWN: Color = Color::Rgb(90, 40, 30);
    pub const C64_BLUE: Color = Color::Rgb(108, 52, 148);
    pub const C64_GREEN: Color = Color::Rgb(87, 200, 100);
}
