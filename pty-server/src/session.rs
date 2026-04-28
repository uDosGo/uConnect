// Session Management
// Handles different Micro modes and their behaviors

use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, PartialEq)]
pub enum SessionType {
    Embed,      // Single embed widget
    MultiPanel, // Multi-panel grid
    C64,        // C64 retro mode
}

#[derive(Debug, Clone)]
pub struct Session {
    pub id: String,
    pub session_type: SessionType,
    pub created_at: u64,
    pub last_activity: u64,
    pub buffer: Arc<Mutex<Vec<String>>>, // Command history
}

impl Session {
    pub fn new(id: String, session_type: SessionType) -> Self {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        Session {
            id,
            session_type,
            created_at: timestamp,
            last_activity: timestamp,
            buffer: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn help(&self) -> String {
        match self.session_type {
            SessionType::Embed => {
                "Micro Embed Mode Help:\r\n\r\n"
                .to_string() +
                "Commands:\r\n" +
                "  help      - Show this help\r\n" +
                "  exit      - Exit session\r\n" +
                "  clear     - Clear screen\r\n" +
                "  date      - Show current date\r\n" +
                "\r\nType any text to echo back.\r\n"
            }
            SessionType::MultiPanel => {
                "Micro Multi-Panel Mode Help:\r\n\r\n"
                .to_string() +
                "Commands:\r\n" +
                "  help      - Show this help\r\n" +
                "  exit      - Exit this panel\r\n" +
                "  clear     - Clear screen\r\n" +
                "  date      - Show current date\r\n" +
                "\r\nPanel-specific:\r\n" +
                "  Each panel is independent.\r\n" +
                "  Use UI controls to manage panels.\r\n"
            }
            SessionType::C64 => {
                "COMMODORE 64 BASIC V2\r\n\r\n"
                .to_string() +
                "  64K RAM SYSTEM  38911 BYTES FREE\r\n\r\n" +
                "READY.\r\n\r\n" +
                "Commands:\r\n" +
                "  LOAD      - Load program\r\n" +
                "  SAVE      - Save program\r\n" +
                "  RUN       - Run program\r\n" +
                "  LIST      - List program\r\n" +
                "  NEW       - Clear memory\r\n" +
                "\r\nType BASIC commands or use modern commands.\r\n"
            }
        }
    }

    pub fn update_activity(&mut self) {
        self.last_activity = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
    }

    pub fn add_to_buffer(&self, text: &str) {
        let mut buffer = self.buffer.lock().unwrap();
        buffer.push(text.to_string());
        if buffer.len() > 100 {
            buffer.remove(0); // Keep buffer size limited
        }
    }

    pub fn get_buffer(&self) -> Vec<String> {
        self.buffer.lock().unwrap().clone()
    }

    pub fn clear_buffer(&self) {
        let mut buffer = self.buffer.lock().unwrap();
        buffer.clear();
    }
}

impl Default for Session {
    fn default() -> Self {
        Session::new("default".to_string(), SessionType::Embed)
    }
}