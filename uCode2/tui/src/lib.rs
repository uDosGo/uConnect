// TUI - Terminal User Interface for uCode2
// Grid/teletext renderer with block graphics, dashboard, and system themes

pub mod dashboard;
pub mod teletext;

use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    prelude::*,
    style::{Color, Modifier, Style},
    widgets::{Block, Borders, List, ListItem, Paragraph, Sparkline, Wrap},
};
use std::io;

pub struct AppState {
    pub current_screen: Screen,
    pub vault_path: String,
    pub notes: Vec<String>,
    pub selected_note: Option<String>,
    pub note_content: String,
    pub input_mode: InputMode,
    pub input_buffer: String,
    pub metrics: dashboard::SystemMetrics,
    /// Teletext-style grid data (character matrix)
    pub teletext_grid: Vec<Vec<char>>,
    pub grid_cursor: (usize, usize),
    /// Dashboard sparkline data
    pub spark_data: Vec<u64>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Screen {
    NotesList,
    NoteView,
    Dashboard,
    TeletextView,
    Help,
    Quit,
}

#[derive(Debug, Clone, PartialEq)]
pub enum InputMode {
    Normal,
    Editing,
}

impl AppState {
    pub fn new(vault_path: &str) -> Self {
        // Build a demo teletext grid
        let demo_grid = teletext::ascii_to_grid(
            "┌──────────────────────┐\n\
             │   uCode2 Teletext      │\n\
             │                        │\n\
             │   Hello from uDos!     │\n\
             │                        │\n\
             └──────────────────────┘",
        );
        AppState {
            current_screen: Screen::Dashboard,
            vault_path: vault_path.to_string(),
            notes: vec![
                "Welcome".into(),
                "Getting Started".into(),
                "Architecture".into(),
            ],
            selected_note: None,
            note_content: String::from("uCode2 TUI — Terminal UI for the uDos ecosystem."),
            input_mode: InputMode::Normal,
            input_buffer: String::new(),
            metrics: dashboard::SystemMetrics::new(),
            teletext_grid: demo_grid,
            grid_cursor: (2, 2),
            spark_data: vec![0, 2, 5, 3, 8, 6, 10, 7, 12, 9, 15, 11, 13, 10, 14],
        }
    }

    pub async fn load_notes(&mut self) {
        let vault = ucode2_vault_bridge::Vault::new(&self.vault_path, &self.vault_path);
        match vault.list_notes() {
            Ok(notes) => {
                self.metrics.vault_note_count = notes.len();
                self.notes = notes;
            }
            Err(e) => {
                log::error!("Failed to load notes: {}", e);
                self.notes = vec!["Error loading vault".into()];
            }
        }
    }

    pub async fn load_note_content(&mut self, note_name: &str) {
        let vault = ucode2_vault_bridge::Vault::new(&self.vault_path, &self.vault_path);
        match vault.read_note(note_name) {
            Ok(note) => {
                self.note_content = note.content;
            }
            Err(e) => {
                log::error!("Failed to load note {}: {}", note_name, e);
                self.note_content = format!("Error loading note: {}", e);
            }
        }
    }
}

pub struct Tui {
    terminal: Terminal<CrosstermBackend<std::io::Stdout>>,
    pub should_quit: bool,
}

impl Tui {
    pub fn new() -> io::Result<Self> {
        enable_raw_mode()?;
        let mut stdout = io::stdout();
        execute!(stdout, EnterAlternateScreen)?;
        let backend = CrosstermBackend::new(stdout);
        let terminal = Terminal::new(backend)?;

        Ok(Tui {
            terminal,
            should_quit: false,
        })
    }

    pub fn draw(&mut self, state: &AppState) -> io::Result<()> {
        self.terminal.draw(|f| {
            let size = f.size();

            // Create layout
            let layout = Layout::default()
                .direction(Direction::Vertical)
                .constraints(
                    [
                        Constraint::Length(1), // Header
                        Constraint::Min(1),    // Main content
                        Constraint::Length(1), // Footer
                    ]
                    .as_ref(),
                )
                .split(size);

            // Header
            let header = Paragraph::new("uCode1 TUI")
                .block(Block::default().borders(Borders::ALL).title("Header"))
                .alignment(Alignment::Center);
            f.render_widget(header, layout[0]);

            // Main content based on current screen
            match state.current_screen {
                Screen::Dashboard => {
                    // System dashboard with gauges and metrics
                    dashboard::render_dashboard(f, layout[1], &state.metrics);
                }
                Screen::TeletextView => {
                    // Teletext grid viewer
                    teletext::render_teletext_grid(
                        f,
                        layout[1],
                        &state.teletext_grid,
                        "uCode2 Teletext",
                        Some(state.grid_cursor),
                    );
                }
                Screen::NotesList => {
                    // Draw notes list
                    let items: Vec<ListItem> = state
                        .notes
                        .iter()
                        .map(|note| ListItem::new(note.clone()))
                        .collect();

                    let list = List::new(items)
                        .block(Block::default().borders(Borders::ALL).title("Notes"))
                        .highlight_style(Style::default().add_modifier(Modifier::BOLD));

                    f.render_widget(list, layout[1]);
                }
                Screen::NoteView => {
                    // Draw note view with sparkline
                    let note_layout = Layout::default()
                        .direction(Direction::Vertical)
                        .constraints([Constraint::Min(1), Constraint::Length(5)].as_ref())
                        .split(layout[1]);

                    let paragraph = Paragraph::new(state.note_content.clone())
                        .block(Block::default().borders(Borders::ALL).title("Note Content"))
                        .wrap(Wrap { trim: true });

                    f.render_widget(paragraph, note_layout[0]);

                    let sparkline = Sparkline::default()
                        .block(Block::default().borders(Borders::ALL).title("Activity"))
                        .style(Style::default().fg(Color::Yellow))
                        .data(&state.spark_data);
                    f.render_widget(sparkline, note_layout[1]);
                }
                Screen::Help => {
                    // Draw help
                    let help_text = "
uCode2 TUI Help

Navigation:
  Tab:      Switch between screens
  ↑/↓:     Navigate lists / move cursor
  ←/→:     Move grid cursor in teletext view
  Enter:    Select item
  q:        Quit
  Esc:      Back to previous screen
  ?:        Show this help

Screens:
  Dashboard:    System metrics, CPU/memory gauges, vault stats
  Notes List:   Browse vault notes
  Teletext:     Teletext-style grid viewer
  Note View:    Read note content with activity sparkline
  Help:         This screen
";

                    let paragraph = Paragraph::new(help_text)
                        .block(Block::default().borders(Borders::ALL).title("Help"))
                        .style(Style::default().fg(Color::Cyan))
                        .wrap(Wrap { trim: true });

                    f.render_widget(paragraph, layout[1]);
                }
                Screen::Quit => {
                    // Draw quit
                    let paragraph = Paragraph::new("Goodbye!")
                        .block(Block::default().borders(Borders::ALL).title("Quit"))
                        .style(Style::default().fg(Color::Red))
                        .alignment(Alignment::Center);

                    f.render_widget(paragraph, layout[1]);
                }
            }

            // Footer
            let footer = Paragraph::new("Press 'q' to quit, '?' for help")
                .block(Block::default().borders(Borders::ALL).title("Footer"))
                .alignment(Alignment::Center);
            f.render_widget(footer, layout[2]);
        })?;

        Ok(())
    }
}

impl Drop for Tui {
    fn drop(&mut self) {
        disable_raw_mode().unwrap();
        execute!(self.terminal.backend_mut(), LeaveAlternateScreen).unwrap();
    }
}

pub async fn run_tui(vault_path: &str) -> io::Result<()> {
    // Initialize TUI
    let mut tui = Tui::new()?;
    let mut state = AppState::new(vault_path);

    // Load initial data
    state.load_notes().await;

    // Main event loop
    while !tui.should_quit {
        state.metrics.update();

        // Rotate spark data
        let last = state.spark_data.last().copied().unwrap_or(0);
        let new_val = last.saturating_add((state.spark_data.len() as u64 * 3) % 7);
        state.spark_data.push(new_val);
        if state.spark_data.len() > 20 {
            state.spark_data.remove(0);
        }

        tui.draw(&state)?;

        // Handle events
        if event::poll(std::time::Duration::from_millis(100))? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('q') => {
                            if state.current_screen == Screen::Quit {
                                tui.should_quit = true;
                            } else {
                                state.current_screen = Screen::Quit;
                            }
                        }
                        KeyCode::Char('?') => {
                            state.current_screen = Screen::Help;
                        }
                        KeyCode::Tab => {
                            // Cycle through screens
                            state.current_screen = match state.current_screen {
                                Screen::Dashboard => Screen::TeletextView,
                                Screen::TeletextView => Screen::NotesList,
                                Screen::NotesList => Screen::Dashboard,
                                Screen::NoteView => Screen::NotesList,
                                _ => Screen::Dashboard,
                            };
                        }
                        KeyCode::Esc => {
                            state.current_screen = Screen::Dashboard;
                        }
                        KeyCode::Up => {
                            let (x, y) = state.grid_cursor;
                            if y > 0 {
                                state.grid_cursor = (x, y - 1);
                            }
                        }
                        KeyCode::Down => {
                            let (x, y) = state.grid_cursor;
                            if y + 1 < state.teletext_grid.len() {
                                state.grid_cursor = (x, y + 1);
                            }
                        }
                        KeyCode::Left => {
                            let (x, y) = state.grid_cursor;
                            if x > 0 {
                                state.grid_cursor = (x - 1, y);
                            }
                        }
                        KeyCode::Right => {
                            let (x, y) = state.grid_cursor;
                            if let Some(row) = state.teletext_grid.get(y) {
                                if x + 1 < row.len() {
                                    state.grid_cursor = (x + 1, y);
                                }
                            }
                        }
                        KeyCode::Enter => {
                            if state.current_screen == Screen::NotesList {
                                if let Some(selected) = state.notes.first() {
                                    let note_name = selected.clone();
                                    state.selected_note = Some(note_name.clone());
                                    state.load_note_content(&note_name).await;
                                    state.current_screen = Screen::NoteView;
                                }
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_state_initialization() {
        let state = AppState::new("/tmp/test");
        assert_eq!(state.current_screen, Screen::Dashboard);
        assert_eq!(state.input_mode, InputMode::Normal);
        assert_eq!(state.teletext_grid.is_empty(), false);
        assert_eq!(state.grid_cursor, (2, 2));
    }

    #[test]
    fn test_screen_transitions() {
        let mut state = AppState::new("/tmp/test");
        assert_eq!(state.current_screen, Screen::Dashboard);
        state.current_screen = Screen::Help;
        assert_eq!(state.current_screen, Screen::Help);
        state.current_screen = Screen::TeletextView;
        assert_eq!(state.current_screen, Screen::TeletextView);
    }
}
