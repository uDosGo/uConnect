//! Color palette system for retro systems

use wasm_bindgen::prelude::*;

/// RGBA color representation
#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct RGBA {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

impl RGBA {
    pub const fn new(r: u8, g: u8, b: u8, a: u8) -> Self {
        Self { r, g, b, a }
    }
    
    pub fn to_css(&self) -> String {
        format!("rgba({}, {}, {}, {})", self.r, self.g, self.b, self.a)
    }
}

/// Color palette with 16 colors (base)
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct ColorPalette {
    pub colors: Vec<RGBA>,
    pub background: usize,
    pub foreground: usize,
}

impl ColorPalette {
    pub fn new(colors: Vec<RGBA>) -> Self {
        Self {
            colors,
            background: 0,
            foreground: 1,
        }
    }
    
    /// C64 default palette (NTSC)
    pub fn c64_default() -> Self {
        Self {
            colors: vec![
                RGBA::new(0x00, 0x00, 0x00, 0xFF),    // Black
                RGBA::new(0xFF, 0xFF, 0xFF, 0xFF),    // White
                RGBA::new(0x88, 0x39, 0x32, 0xFF),    // Red
                RGBA::new(0x67, 0xB6, 0xBD, 0xFF),    // Cyan
                RGBA::new(0x8B, 0x3F, 0x96, 0xFF),    // Purple
                RGBA::new(0x55, 0xA0, 0x49, 0xFF),    // Green
                RGBA::new(0x40, 0x31, 0x8D, 0xFF),    // Blue
                RGBA::new(0xC8, 0xC5, 0x69, 0xFF),    // Yellow
                RGBA::new(0x8B, 0x54, 0x2C, 0xFF),    // Orange
                RGBA::new(0x55, 0x40, 0x00, 0xFF),    // Brown
                RGBA::new(0xB8, 0x69, 0x62, 0xFF),    // Pink
                RGBA::new(0x6E, 0x6E, 0x6E, 0xFF),    // Dark Gray
                RGBA::new(0x96, 0x96, 0x96, 0xFF),    // Medium Gray
                RGBA::new(0x75, 0xCE, 0x66, 0xFF),    // Light Green
                RGBA::new(0x6F, 0x5E, 0x91, 0xFF),    // Light Blue
                RGBA::new(0xA9, 0xA9, 0xA9, 0xFF),    // Light Gray
            ],
            background: 0,  // Black
            foreground: 1,  // White
        }
    }
    
    /// NES default palette
    pub fn nes_default() -> Self {
        Self {
            colors: vec![
                RGBA::new(0x66, 0x66, 0x66, 0xFF), // Background 0
                RGBA::new(0x00, 0x26, 0x88, 0xFF), // Background 1
                RGBA::new(0x14, 0x12, 0xA7, 0xFF), // Background 2
                RGBA::new(0x3B, 0x00, 0xA4, 0xFF), // Background 3
                RGBA::new(0x5C, 0x00, 0x7E, 0xFF), // Background 4
                RGBA::new(0x6E, 0x00, 0x40, 0xFF), // Background 5
                RGBA::new(0x6C, 0x06, 0x00, 0xFF), // Background 6
                RGBA::new(0x56, 0x1D, 0x00, 0xFF), // Background 7
                RGBA::new(0x33, 0x35, 0x00, 0xFF), // Background 8
                RGBA::new(0x0B, 0x48, 0x00, 0xFF), // Background 9
                RGBA::new(0x00, 0x51, 0x00, 0xFF), // Background 10
                RGBA::new(0x00, 0x4F, 0x08, 0xFF), // Background 11
                RGBA::new(0x00, 0x47, 0x47, 0xFF), // Background 12
                RGBA::new(0x00, 0x00, 0x00, 0xFF), // Background 13 (black)
                RGBA::new(0x00, 0x00, 0x00, 0xFF), // Background 14 (black)
                RGBA::new(0x00, 0x00, 0x00, 0xFF), // Background 15 (black)
            ],
            background: 0,
            foreground: 1,
        }
    }
    
    /// Teletext default palette
    pub fn teletext_default() -> Self {
        Self {
            colors: vec![
                RGBA::new(0x00, 0x00, 0x00, 0xFF), // Black
                RGBA::new(0xFF, 0x00, 0x00, 0xFF), // Red
                RGBA::new(0x00, 0xFF, 0x00, 0xFF), // Green
                RGBA::new(0xFF, 0xFF, 0x00, 0xFF), // Yellow
                RGBA::new(0x00, 0x00, 0xFF, 0xFF), // Blue
                RGBA::new(0xFF, 0x00, 0xFF, 0xFF), // Magenta
                RGBA::new(0x00, 0xFF, 0xFF, 0xFF), // Cyan
                RGBA::new(0xFF, 0xFF, 0xFF, 0xFF), // White
            ],
            background: 0,  // Black
            foreground: 7,  // White
        }
    }
}

#[wasm_bindgen]
impl ColorPalette {
    pub fn set_background(&mut self, index: usize) {
        self.background = index;
    }
    
    pub fn set_foreground(&mut self, index: usize) {
        self.foreground = index;
    }
    
    pub fn get_color(&self, index: usize) -> RGBA {
        if index < self.colors.len() {
            self.colors[index]
        } else {
            self.colors[0] // Return black as default
        }
    }
}
