//! Retro Core - Authentic Retro System Renderer
//! Provides hardware-accurate rendering for C64, NES, and Teletext systems

use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

mod color;
mod grid;
mod fonts;
mod systems;
mod renderer;

pub use color::*;
pub use grid::*;
pub use fonts::*;
pub use systems::*;
pub use renderer::*;

/// Initialize the retro renderer
#[wasm_bindgen]
pub fn init_retro_renderer(canvas_id: &str) -> Result<JsValue, JsValue> {
    // Get canvas element
    let document = web_sys::window().unwrap().document().unwrap();
    let canvas = document.get_element_by_id(canvas_id)
        .unwrap()
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .unwrap();
    
    let context = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<CanvasRenderingContext2d>()
        .unwrap();
    
    // Create renderer
    let renderer = RetroRenderer::new(context);
    
    Ok(JsValue::from(renderer))
}

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
        
        for y in 0..self.grid.height {
            for x in 0..self.grid.width {
                let char_code = self.grid.get_character(x, y);
                let color_index = self.grid.get_color(x, y);
                let color = self.palette.colors[color_index as usize];
                
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

// Re-export for WASM
#[wasm_bindgen]
pub fn create_c64_renderer(canvas_id: &str) -> Result<RetroRenderer, JsValue> {
    let document = web_sys::window().unwrap().document().unwrap();
    let canvas = document.get_element_by_id(canvas_id)
        .unwrap()
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .unwrap();
    
    let context = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<CanvasRenderingContext2d>()
        .unwrap();
    
    let mut renderer = RetroRenderer::new(context);
    renderer.set_system(RetroSystem::C64);
    
    Ok(renderer)
}

#[wasm_bindgen]
pub fn create_nes_renderer(canvas_id: &str) -> Result<RetroRenderer, JsValue> {
    let document = web_sys::window().unwrap().document().unwrap();
    let canvas = document.get_element_by_id(canvas_id)
        .unwrap()
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .unwrap();
    
    let context = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<CanvasRenderingContext2d>()
        .unwrap();
    
    let mut renderer = RetroRenderer::new(context);
    renderer.set_system(RetroSystem::NES);
    
    Ok(renderer)
}

#[wasm_bindgen]
pub fn create_teletext_renderer(canvas_id: &str) -> Result<RetroRenderer, JsValue> {
    let document = web_sys::window().unwrap().document().unwrap();
    let canvas = document.get_element_by_id(canvas_id)
        .unwrap()
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .unwrap();
    
    let context = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<CanvasRenderingContext2d>()
        .unwrap();
    
    let mut renderer = RetroRenderer::new(context);
    renderer.set_system(RetroSystem::Teletext);
    
    Ok(renderer)
}
