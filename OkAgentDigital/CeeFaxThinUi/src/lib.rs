// CeeFaxThinUi - High-performance teletext rendering engine
// Part of OkAgentDigital component suite

use image::{DynamicImage, Rgba};
use rgb::RGBA8;
use std::slice;

/// Teletext character cell (40x25 grid)
#[derive(Debug, Clone, Copy)]
pub struct TeletextCell {
    pub character: char,
    pub foreground: RGBA8,
    pub background: RGBA8,
    pub blink: bool,
    pub bold: bool,
}

impl Default for TeletextCell {
    fn default() -> Self {
        TeletextCell {
            character: ' ',
            foreground: RGBA8 { r: 0, g: 255, b: 0, a: 255 }, // Green
            background: RGBA8 { r: 0, g: 0, b: 0, a: 255 },   // Black
            blink: false,
            bold: false,
        }
    }
}

/// Teletext page (40 columns x 25 rows)
#[derive(Debug, Clone)]
pub struct TeletextPage {
    pub grid: [[TeletextCell; 40]; 25],
    pub navigation: Vec<String>,
    pub page_number: u16,
}

impl Default for TeletextPage {
    fn default() -> Self {
        TeletextPage {
            grid: [[TeletextCell::default(); 40]; 25],
            navigation: Vec::new(),
            page_number: 100,
        }
    }
}

/// Teletext renderer
pub struct TeletextRenderer {
    character_width: u32,
    character_height: u32,
    scale: u32,
}

impl TeletextRenderer {
    pub fn new() -> Self {
        Self {
            character_width: 8,
            character_height: 10,
            scale: 2,
        }
    }

    pub fn with_scale(mut self, scale: u32) -> Self {
        self.scale = scale;
        self
    }

    /// Render teletext page to RGBA image
    pub fn render(&self, page: &TeletextPage) -> DynamicImage {
        let width = 40 * self.character_width * self.scale;
        let height = 25 * self.character_height * self.scale;
        let mut img = DynamicImage::new_rgba8(width, height);
        
        for (y, row) in page.grid.iter().enumerate() {
            for (x, cell) in row.iter().enumerate() {
                let cell_x = (x as u32) * self.character_width * self.scale;
                let cell_y = (y as u32) * self.character_height * self.scale;
                
                // Draw character background
                for dy in 0..(self.character_height * self.scale) {
                    for dx in 0..(self.character_width * self.scale) {
                        let pixel_x = cell_x + dx;
                        let pixel_y = cell_y + dy;
                        if pixel_x < width && pixel_y < height {
                            img.put_pixel(
                                pixel_x,
                                pixel_y,
                                Rgba([
                                    cell.background.r,
                                    cell.background.g,
                                    cell.background.b,
                                    cell.background.a
                                ])
                            );
                        }
                    }
                }
                
                // Draw character (simplified - in real implementation use font)
                // For now, just draw a rectangle representing the character
                for dy in 2..(self.character_height * self.scale - 2) {
                    for dx in 2..(self.character_width * self.scale - 2) {
                        let pixel_x = cell_x + dx;
                        let pixel_y = cell_y + dy;
                        if pixel_x < width && pixel_y < height {
                            img.put_pixel(
                                pixel_x,
                                pixel_y,
                                Rgba([
                                    cell.foreground.r,
                                    cell.foreground.g,
                                    cell.foreground.b,
                                    cell.foreground.a
                                ])
                            );
                        }
                    }
                }
            }
        }
        
        img
    }

    /// Create a test page
    pub fn create_test_page() -> TeletextPage {
        let mut page = TeletextPage::default();
        
        // Write "Hello, World!" in the middle
        let text = "Hello, World!";
        let start_x = (40 - text.len()) / 2;
        let start_y = 12;
        
        for (i, ch) in text.chars().enumerate() {
            if start_x + i < 40 {
                page.grid[start_y][start_x + i].character = ch;
            }
        }
        
        page
    }
}

/// Python bindings using PyO3
#[cfg(feature = "python")]
use pyo3::prelude::*;

#[cfg(feature = "python")]
#[pyclass]
struct PyTeletextRenderer {
    renderer: TeletextRenderer,
}

#[cfg(feature = "python")]
#[pymethods]
impl PyTeletextRenderer {
    #[new]
    fn new() -> Self {
        Self {
            renderer: TeletextRenderer::new(),
        }
    }

    fn render(&self, py: Python, page_data: &PyDict) -> PyResult<PyObject> {
        // Parse page data from Python
        // Render to image
        // Return as Python bytes
        Ok(py.None())
    }
}

#[cfg(feature = "python")]
#[pymodule]
fn ceefax_thinui(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyTeletextRenderer>()?;
    Ok(())
}

// C API for uCode1 Python bindings
#[no_mangle]
pub extern "C" fn ceefax_create_renderer() -> *mut TeletextRenderer {
    Box::into_raw(Box::new(TeletextRenderer::new()))
}

#[no_mangle]
pub extern "C" fn ceefax_render_page(
    renderer: *mut TeletextRenderer,
    page: *const TeletextPage
) -> *mut u8 {
    let renderer = unsafe { &*renderer };
    let page = unsafe { &*page };
    
    let img = renderer.render(page);
    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();
    
    // Convert to raw bytes (caller responsible for freeing)
    let mut buffer = Vec::with_capacity((width * height * 4) as usize);
    buffer.extend_from_slice(rgba.as_raw());
    
    let ptr = buffer.as_mut_ptr();
    std::mem::forget(buffer);
    ptr
}

#[no_mangle]
pub extern "C" fn ceefax_free_buffer(ptr: *mut u8) {
    unsafe {
        let _ = Vec::from_raw_parts(ptr, 0, 0);
    }
}

#[no_mangle]
pub extern "C" fn ceefax_free_renderer(renderer: *mut TeletextRenderer) {
    unsafe {
        let _ = Box::from_raw(renderer);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_renderer_creation() {
        let renderer = TeletextRenderer::new();
        let page = renderer.create_test_page();
        let img = renderer.render(&page);
        assert_eq!(img.width(), 40 * 8 * 2);
        assert_eq!(img.height(), 25 * 10 * 2);
    }
    
    #[test]
    fn test_page_creation() {
        let page = TeletextPage::default();
        assert_eq!(page.page_number, 100);
        assert_eq!(page.grid[0][0].character, ' ');
    }
}