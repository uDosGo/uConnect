use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

#[wasm_bindgen]
pub struct RetroRenderer {
    context: CanvasRenderingContext2d,
}

#[wasm_bindgen]
impl RetroRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_id: &str) -> Result<RetroRenderer, JsValue> {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
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
        
        Ok(RetroRenderer { context })
    }
    
    pub fn render(&self) {
        // Clear canvas
        let width = self.context.canvas().unwrap().width() as f64;
        let height = self.context.canvas().unwrap().height() as f64;
        self.context.clear_rect(0.0, 0.0, width, height);
        
        // Draw a simple pattern
        self.context.set_fill_style(&JsValue::from_str("#67B6BD"));
        self.context.fill_rect(0.0, 0.0, width, height);
        
        // Draw grid
        for y in 0..25 {
            for x in 0..50 {
                if (x + y) % 2 == 0 {
                    self.context.set_fill_style(&JsValue::from_str("#8B3F96"));
                } else {
                    self.context.set_fill_style(&JsValue::from_str("#67B6BD"));
                }
                self.context.fill_rect(
                    (x * 16) as f64,
                    (y * 24 + 100) as f64,
                    16.0,
                    24.0
                );
            }
        }
    }
}
