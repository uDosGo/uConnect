//! Retro system definitions

use wasm_bindgen::prelude::*;

/// Supported retro systems
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum RetroSystem {
    C64,
    NES,
    Teletext,
}

#[wasm_bindgen]
impl RetroSystem {
    pub fn name(&self) -> String {
        match self {
            RetroSystem::C64 => "C64".to_string(),
            RetroSystem::NES => "NES".to_string(),
            RetroSystem::Teletext => "Teletext".to_string(),
        }
    }
}

/// System-specific components
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct SystemComponents {
    system: RetroSystem,
    // System-specific data will go here
}

impl SystemComponents {
    pub fn new(system: RetroSystem) -> Self {
        Self { system }
    }
}
