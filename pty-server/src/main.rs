// Micro PTY Server
// WebSocket-based pseudo-terminal server for Micro terminal integration
// Supports three modes: embed, multi-panel, and C64 retro

use std::collections::HashMap;
use std::env;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use futures::{SinkExt, StreamExt};
use log::{info, error, debug};
use warp::Filter;

mod session;
use session::{Session, SessionType};

#[tokio::main]
async fn main() {
    // Initialize logging
    env_logger::init();
    
    // Load environment variables
    dotenv::dotenv().ok();
    
    let port = env::var("PTY_PORT").unwrap_or_else(|_| "3001".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    info!("Starting Micro PTY Server on port {}", port);
    
    // Create shared session manager
    let sessions = Arc::new(Mutex::new(HashMap::new()));
    
    // WebSocket route
    let ws_route = warp::path("pty")
        .and(warp::path::param::<String>())
        .and(warp::ws())
        .map(move |mode: String, ws: warp::ws::Ws| {
            let sessions = sessions.clone();
            ws.on_upgrade(move |socket| handle_connection(socket, mode, sessions))
        });
    
    // Health check route
    let health_route = warp::path("health")
        .map(|| warp::reply::json(&serde_json::json!({"status": "healthy", "service": "pty-server"})));
    
    // Combine routes
    let routes = ws_route.or(health_route);
    
    info!("PTY Server ready at ws://{}/pty/{{mode}}", addr);
    
    // Start the server
    warp::serve(routes)
        .run(([0, 0, 0, 0], port.parse().unwrap()))
        .await;
}

async fn handle_connection(websocket: warp::ws::WebSocket, mode: String, sessions: Arc<Mutex<HashMap<String, Session>>>) {
    let session_id = Uuid::new_v4().to_string();
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    
    // Determine session type from path
    let session_type = match mode.as_str() {
        "embed" => SessionType::Embed,
        "c64" => SessionType::C64,
        _ if mode.starts_with("panel_") => SessionType::MultiPanel,
        _ => SessionType::Embed, // default
    };
    
    info!("New connection: {} (type: {:?})", session_id, session_type);
    
    // Create a new session
    let session = Session::new(session_id.clone(), session_type.clone());
    
    // Store session in manager
    sessions.lock().unwrap().insert(session_id.clone(), session.clone());
    
    // Split websocket into sender and receiver
    let (mut ws_sender, mut ws_receiver) = websocket.split();
    
    // Send welcome message based on mode
    let welcome_message = match session_type {
        SessionType::Embed => "Micro Embed Mode\r\nType 'help' for commands\r\n".to_string(),
        SessionType::MultiPanel => format!("Micro Panel Mode (ID: {})\r\nReady\r\n", session_id),
        SessionType::C64 => {
            "**** COMMODORE 64 BASIC V2 ****\r\n\r\n 64K RAM SYSTEM  38911 BASIC BYTES FREE\r\n\r\nREADY.\r\n".to_string()
        }
    };
    
    if let Err(e) = ws_sender.send(warp::ws::Message::text(welcome_message)).await {
        error!("Failed to send welcome message: {}", e);
        return;
    }
    
    // Main message loop
    while let Some(result) = ws_receiver.next().await {
        match result {
            Ok(msg) => {
                if let Ok(text) = msg.to_str() {
                    debug!("Received from {}: {}", session_id, text);
                    
                    // Handle commands
                    let response = match text {
                        "help" => session.help(),
                        "exit" | "quit" => {
                            sessions.lock().unwrap().remove(&session_id);
                            "Goodbye!\r\n".to_string()
                        }
                        "clear" => "\x1B[2J\x1B[H".to_string(), // ANSI clear screen
                        "date" => {
                            let now = SystemTime::now()
                                .duration_since(UNIX_EPOCH)
                                .unwrap();
                            format!("Current date: {}\r\n", timestamp_to_date(now.as_secs()))
                        }
                        _ => {
                            // Echo back with timestamp
                            format!("[{}] You said: {}\r\n", timestamp_to_time(timestamp), text)
                        }
                    };
                    
                    if let Err(e) = ws_sender.send(warp::ws::Message::text(response)).await {
                        error!("Failed to send response: {}", e);
                        break;
                    }
                } else if msg.is_close() {
                    info!("Connection closed by client: {}", session_id);
                    sessions.lock().unwrap().remove(&session_id);
                    break;
                }
            }
            Err(e) => {
                error!("WebSocket error for {}: {}", session_id, e);
                sessions.lock().unwrap().remove(&session_id);
                break;
            }
        }
    }
    
    info!("Session ended: {}", session_id);
}

fn timestamp_to_date(timestamp: u64) -> String {
    let datetime = chrono::NaiveDateTime::from_timestamp_opt(timestamp as i64, 0)
        .unwrap_or_default();
    datetime.format("%Y-%m-%d %H:%M:%S").to_string()
}

fn timestamp_to_time(timestamp: u64) -> String {
    let datetime = chrono::NaiveDateTime::from_timestamp_opt(timestamp as i64, 0)
        .unwrap_or_default();
    datetime.format("%H:%M:%S").to_string()
}