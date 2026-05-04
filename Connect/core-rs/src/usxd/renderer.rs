use crate::usxd::parser::USXDSurface;
use crossterm::event::KeyCode;
use ratatui::{
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::Text,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

pub struct USXDRenderer {
    pub surface: USXDSurface,
    pub mode: RenderMode,
}

impl USXDRenderer {
    pub fn render(&self, frame: &mut Frame) {
        let n = self.surface.regions.len().max(1);
        let constraints = vec![Constraint::Percentage((100 / n) as u16); n];
        let chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints(constraints)
            .split(frame.area());

        for (idx, region) in self.surface.regions.iter().enumerate() {
            let style = self.mode.style();
            let block = Block::default()
                .title(region.title.as_str())
                .borders(Borders::ALL)
                .style(style);
            let text = Text::from(region.content.clone());
            let paragraph = Paragraph::new(text).block(block).style(style);
            if let Some(area) = chunks.get(idx).copied() {
                frame.render_widget(paragraph, area);
            }
        }
    }

    pub fn handle_key(&mut self, key: KeyCode) -> bool {
        match key {
            KeyCode::Char('q') | KeyCode::Esc => true,
            KeyCode::Char('t') => {
                self.mode = RenderMode::Teletext;
                false
            }
            KeyCode::Char('m') => {
                self.mode = RenderMode::Mono;
                false
            }
            KeyCode::Char('w') => {
                self.mode = RenderMode::Wireframe;
                false
            }
            _ => false,
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub enum RenderMode {
    Teletext,
    Mono,
    Wireframe,
}

impl RenderMode {
    fn style(self) -> Style {
        match self {
            RenderMode::Teletext => Style::default()
                .fg(Color::Rgb(0, 255, 0))
                .bg(Color::Black)
                .add_modifier(Modifier::BOLD),
            RenderMode::Mono => Style::default().fg(Color::White).bg(Color::Black),
            RenderMode::Wireframe => Style::default().fg(Color::Cyan).bg(Color::Black),
        }
    }
}
