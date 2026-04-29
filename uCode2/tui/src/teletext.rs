// Teletext grid rendering for uCode2 TUI
// Renders ASCII/teletext grids using ratatui block graphics

use ratatui::{
    prelude::*,
    style::{Color, Style},
    widgets::{Block, Borders, Paragraph, Wrap},
};

/// Renders a teletext-style grid from a 2D character array
pub fn render_teletext_grid(
    f: &mut Frame,
    area: Rect,
    grid: &[Vec<char>],
    title: &str,
    cursor_pos: Option<(usize, usize)>,
) {
    let mut lines: Vec<String> = Vec::new();
    for (y, row) in grid.iter().enumerate() {
        let mut line = String::new();
        for (x, &ch) in row.iter().enumerate() {
            if let Some((cx, cy)) = cursor_pos {
                if cx == x && cy == y {
                    line.push('\u{2588}'); // Full block for cursor
                    continue;
                }
            }
            line.push(ch);
        }
        lines.push(line);
    }

    let text: Vec<Line> = lines
        .into_iter()
        .map(|l| Line::from(Span::raw(l)))
        .collect();

    let paragraph = Paragraph::new(text)
        .block(Block::default().borders(Borders::ALL).title(title))
        .style(Style::default().fg(Color::Cyan).bg(Color::Black))
        .wrap(Wrap { trim: false });

    f.render_widget(paragraph, area);
}

/// Render a simple ASCII box using unicode block chars
pub fn render_box(f: &mut Frame, area: Rect, content: &[&str], title: &str) {
    let box_lines: Vec<String> = content.iter().map(|&s| format!("│ {} │", s)).collect();

    let width = content.iter().map(|s| s.len()).max().unwrap_or(0).max(3);
    let top = format!("┌─{}─┐", "─".repeat(width));
    let bottom = format!("└─{}─┘", "─".repeat(width));

    let mut display = vec![top];
    display.extend(box_lines);
    display.push(bottom);

    let text: Vec<Line> = display
        .into_iter()
        .map(|l| Line::from(Span::raw(l)))
        .collect();

    let paragraph = Paragraph::new(text)
        .block(Block::default().borders(Borders::ALL).title(title))
        .style(Style::default().fg(Color::Green).bg(Color::Black));

    f.render_widget(paragraph, area);
}

/// Convert a raw ASCII string into a 2D grid of chars
pub fn ascii_to_grid(text: &str) -> Vec<Vec<char>> {
    text.lines().map(|line| line.chars().collect()).collect()
}
