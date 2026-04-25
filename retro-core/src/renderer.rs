//! Main renderer module

use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

use crate::color::*;
use crate::grid::*;
use crate::fonts::*;
use crate::systems::*;

/// Main renderer structure
pub struct RetroRenderer {
    context: CanvasRenderingContext2d,
    grid: CharacterGrid,
    palette: ColorPalette,
    font: FontType,
    system: RetroSystem,
}

impl RetroRenderer {
    pub fn new(context: CanvasRenderingContext2d) -> Self {
        Self {
            context,
            grid: CharacterGrid::new(40, 25),
            palette: ColorPalette::c64_default(),
            font: FontType::C64(PETSCII::default()),
            system: RetroSystem::C64,
        }
    }
    
    pub fn set_system(&mut self, system: RetroSystem) {
        self.system = system;
        
        // Update palette and font based on system
        match system {
            RetroSystem::C64 => {
                self.palette = ColorPalette::c64_default();
                self.font = FontType::C64(PETSCII::default());
            }
            RetroSystem::NES => {
                self.palette = ColorPalette::nes_default();
                self.font = FontType::NES(NESFont::default());
            }
            RetroSystem::Teletext => {
                self.palette = ColorPalette::teletext_default();
                self.font = FontType::Teletext(TeletextFont::default());
            }
        }
    }
    
    pub fn render(&self) {
        // Clear canvas
        let width = self.context.canvas().unwrap().width() as f64;
        let height = self.context.canvas().unwrap().height() as f64;
        self.context.clear_rect(0.0, 0.0, width, height);
        
        // Render grid
        self.render_grid();
        
        // Apply CRT effects
        self.apply_crt_effects();
    }
    
    fn render_grid(&self) {
        let cell_width = 8.0;
        let cell_height = 8.0;
        
        for y in 0..self.grid.get_height() {
            for x in 0..self.grid.get_width() {
                let char_code = self.grid.get_character(x, y);
                let color_index = self.grid.get_color(x, y);
                let color = self.palette.get_color(color_index as usize);
                
                // Get character bitmap
                let bitmap = match &self.font {
                    FontType::C64(font) => font.get_glyph(char_code),
                    FontType::NES(font) => font.get_tile(char_code),
                    FontType::Teletext(font) => font.get_glyph(char_code),
                    FontType::Custom(_) => [[false; 8]; 8],
                };
                
                // Render character
                for py in 0..8 {
                    for px in 0..8 {
                        if bitmap[py][px] {
                            let screen_x = x as f64 * cell_width + px as f64;
                            let screen_y = y as f64 * cell_height + py as f64;
                            
                            self.context.begin_path();
                            self.context.rect(screen_x, screen_y, 1.0, 1.0);
                            self.context.set_fill_style(&color.to_css());
                            self.context.fill();
                        }
                    }
                }
            }
        }
    }
    
    fn apply_crt_effects(&self) {
        // TODO: Implement scanlines, phosphor, curvature
    }
}

#[wasm_bindgen]
impl RetroRenderer {
    pub fn set_character(&mut self, x: u8, y: u8, char: u8, color: u8) {
        self.grid.set_character(x, y, char, color);
    }
    
    pub fn render_frame(&self) {
        self.render();
    }
}
