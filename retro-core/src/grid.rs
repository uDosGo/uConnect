//! Character grid system for retro displays

use wasm_bindgen::prelude::*;

/// Character grid (40×25 baseline)
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct CharacterGrid {
    width: u8,
    height: u8,
    characters: Vec<Vec<u8>>,  // Character codes
    colors: Vec<Vec<u8>>,      // Color indices
    dirty: Vec<Vec<bool>>,      // Dirty flags for optimization
}

#[wasm_bindgen]
impl CharacterGrid {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u8, height: u8) -> Self {
        let mut characters = Vec::with_capacity(height as usize);
        let mut colors = Vec::with_capacity(height as usize);
        let mut dirty = Vec::with_capacity(height as usize);
        
        for _ in 0..height {
            characters.push(vec![0; width as usize]);
            colors.push(vec![1; width as usize]); // Default to white
            dirty.push(vec![true; width as usize]);
        }
        
        Self {
            width,
            height,
            characters,
            colors,
            dirty,
        }
    }
    
    pub fn get_width(&self) -> u8 {
        self.width
    }
    
    pub fn get_height(&self) -> u8 {
        self.height
    }
    
    pub fn set_character(&mut self, x: u8, y: u8, char: u8, color: u8) {
        if x < self.width && y < self.height {
            self.characters[y as usize][x as usize] = char;
            self.colors[y as usize][x as usize] = color;
            self.dirty[y as usize][x as usize] = true;
        }
    }
    
    pub fn get_character(&self, x: u8, y: u8) -> u8 {
        if x < self.width && y < self.height {
            self.characters[y as usize][x as usize]
        } else {
            0
        }
    }
    
    pub fn get_color(&self, x: u8, y: u8) -> u8 {
        if x < self.width && y < self.height {
            self.colors[y as usize][x as usize]
        } else {
            1
        }
    }
    
    pub fn clear(&mut self, char: u8, color: u8) {
        for y in 0..self.height {
            for x in 0..self.width {
                self.characters[y as usize][x as usize] = char;
                self.colors[y as usize][x as usize] = color;
                self.dirty[y as usize][x as usize] = true;
            }
        }
    }
    
    pub fn is_dirty(&self, x: u8, y: u8) -> bool {
        if x < self.width && y < self.height {
            self.dirty[y as usize][x as usize]
        } else {
            false
        }
    }
    
    pub fn clear_dirty(&mut self) {
        for y in 0..self.height {
            for x in 0..self.width {
                self.dirty[y as usize][x as usize] = false;
            }
        }
    }
}

impl Default for CharacterGrid {
    fn default() -> Self {
        Self::new(40, 25)
    }
}
