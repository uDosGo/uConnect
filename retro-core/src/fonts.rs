//! Font systems for retro displays

use wasm_bindgen::prelude::*;

/// Font types
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub enum FontType {
    C64(PETSCII),
    NES(NESFont),
    Teletext(TeletextFont),
    Custom(Vec<u8>),
}

/// PETSCII font (C64)
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct PETSCII {
    glyphs: [[[bool; 8]; 8]; 256],  // 256 characters × 8×8 pixels
}

#[wasm_bindgen]
impl PETSCII {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        // Create default PETSCII font
        let mut glyphs = [[[false; 8]; 8]; 256];
        
        // Space character (0x20)
        glyphs[0x20] = [[false; 8]; 8];
        
        // Letter 'A' (0x41)
        glyphs[0x41] = [
            [false, false, true, true, false, false, false, false],
            [false, true, false, false, true, false, false, false],
            [false, true, false, false, true, false, false, false],
            [false, true, true, true, true, false, false, false],
            [false, true, false, false, true, false, false, false],
            [false, true, false, false, true, false, false, false],
            [false, true, false, false, true, false, false, false],
            [false, false, false, false, false, false, false, false],
        ];
        
        // Letter 'B' (0x42)
        glyphs[0x42] = [
            [false, true, true, true, false, false, false, false],
            [false, true, false, false, true, false, false, false],
            [false, true, false, false, true, false, false, false],
            [false, true, true, true, false, false, false, false],
            [false, true, false, false, true, false, false, false],
            [false, true, false, false, true, false, false, false],
            [false, true, true, true, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ];
        
        // Add more characters here...
        // For now, create simple block characters
        for i in 0x20..0x80 {
            if glyphs[i] == [[false; 8]; 8] {
                // Create a simple representation
                let row = i - 0x20;
                for py in 0..8 {
                    for px in 0..8 {
                        if (px + py) % 2 == 0 && row % 2 == 0 {
                            glyphs[i][py][px] = true;
                        }
                    }
                }
            }
        }
        
        Self { glyphs }
    }
    
    pub fn get_glyph(&self, char_code: u8) -> [[bool; 8]; 8] {
        self.glyphs[char_code as usize]
    }
    
    pub fn default() -> Self {
        Self::new()
    }
}

/// NES Font
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct NESFont {
    tiles: [[[bool; 8]; 8]; 256],  // 256 tiles × 8×8 pixels
}

#[wasm_bindgen]
impl NESFont {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let tiles = [[[false; 8]; 8]; 256];
        Self { tiles }
    }
    
    pub fn get_tile(&self, tile_index: u8) -> [[bool; 8]; 8] {
        self.tiles[tile_index as usize]
    }
    
    pub fn default() -> Self {
        Self::new()
    }
}

/// Teletext Font
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct TeletextFont {
    glyphs: [[[bool; 12]; 10]; 256],  // 256 characters × 12×10 pixels
}

#[wasm_bindgen]
impl TeletextFont {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let glyphs = [[[false; 12]; 10]; 256];
        Self { glyphs }
    }
    
    pub fn get_glyph(&self, char_code: u8) -> [[bool; 8]; 8] {
        // Convert 12×10 to 8×8 for compatibility
        let mut result = [[false; 8]; 8];
        let full_glyph = self.glyphs[char_code as usize];
        
        for py in 0..8 {
            for px in 0..8 {
                result[py][px] = full_glyph[py][px];
            }
        }
        
        result
    }
    
    pub fn default() -> Self {
        Self::new()
    }
}

#[wasm_bindgen]
impl FontType {
    #[wasm_bindgen(constructor)]
    pub fn c64() -> Self {
        FontType::C64(PETSCII::default())
    }
    
    #[wasm_bindgen(constructor)]
    pub fn nes() -> Self {
        FontType::NES(NESFont::default())
    }
    
    #[wasm_bindgen(constructor)]
    pub fn teletext() -> Self {
        FontType::Teletext(TeletextFont::default())
    }
}
