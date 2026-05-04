// MCP Audit Logging System
// Comprehensive logging for all MCP operations

use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};
use chrono::{Utc, DateTime};
use anyhow::{Result, anyhow};

/// Audit log entry structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLogEntry {
    pub timestamp: DateTime<Utc>,
    pub request_id: String,
    pub token_id: Option<String>,
    pub user_id: Option<String>,
    pub endpoint: String,
    pub method: String,
    pub tool_name: Option<String>,
    pub status: String, // success, failure, error
    pub error_code: Option<i32>,
    pub error_message: Option<String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub response_time_ms: u64,
    pub metadata: serde_json::Value,
}

impl AuditLogEntry {
    pub fn new(
        request_id: &str,
        endpoint: &str,
        method: &str,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            request_id: request_id.to_string(),
            token_id: None,
            user_id: None,
            endpoint: endpoint.to_string(),
            method: method.to_string(),
            tool_name: None,
            status: "pending".to_string(),
            error_code: None,
            error_message: None,
            ip_address: None,
            user_agent: None,
            response_time_ms: 0,
            metadata: serde_json::json!({}),
        }
    }

    pub fn with_token(mut self, token_id: &str, user_id: Option<String>) -> Self {
        self.token_id = Some(token_id.to_string());
        self.user_id = user_id;
        self
    }

    pub fn with_tool(mut self, tool_name: &str) -> Self {
        self.tool_name = Some(tool_name.to_string());
        self
    }

    pub fn with_success(mut self, response_time_ms: u64) -> Self {
        self.status = "success".to_string();
        self.response_time_ms = response_time_ms;
        self
    }

    pub fn with_error(mut self, error_code: i32, error_message: &str, response_time_ms: u64) -> Self {
        self.status = "error".to_string();
        self.error_code = Some(error_code);
        self.error_message = Some(error_message.to_string());
        self.response_time_ms = response_time_ms;
        self
    }

    pub fn with_metadata(mut self, metadata: serde_json::Value) -> Self {
        self.metadata = metadata;
        self
    }

    pub fn with_client_info(mut self, ip_address: &str, user_agent: &str) -> Self {
        self.ip_address = Some(ip_address.to_string());
        self.user_agent = Some(user_agent.to_string());
        self
    }
}

/// Audit logger configuration
#[derive(Debug, Clone)]
pub struct AuditLoggerConfig {
    pub log_directory: PathBuf,
    pub max_file_size: u64, // bytes
    pub max_files: usize,
    pub log_level: String, // info, warn, error
}

impl Default for AuditLoggerConfig {
    fn default() -> Self {
        Self {
            log_directory: PathBuf::from("./logs"),
            max_file_size: 10 * 1024 * 1024, // 10MB
            max_files: 5,
            log_level: "info".to_string(),
        }
    }
}

/// Audit logging system
#[derive(Debug, Clone)]
pub struct AuditLogger {
    config: AuditLoggerConfig,
    current_log_file: Arc<Mutex<String>>,
    log_file_size: Arc<Mutex<u64>>,
}

impl AuditLogger {
    pub fn new(config: AuditLoggerConfig) -> Result<Self> {
        // Create log directory if it doesn't exist
        std::fs::create_dir_all(&config.log_directory)?;
        
        // Find or create current log file
        let current_file = Self::find_current_log_file(&config)?;
        let file_size = std::fs::metadata(&current_file)
            .map(|m| m.len())
            .unwrap_or(0);
        
        Ok(Self {
            config,
            current_log_file: Arc::new(Mutex::new(current_file)),
            log_file_size: Arc::new(Mutex::new(file_size)),
        })
    }

    /// Find or create the current log file
    fn find_current_log_file(config: &AuditLoggerConfig) -> Result<String> {
        let mut log_files: Vec<_> = std::fs::read_dir(&config.log_directory)?
            .filter_map(|entry| {
                let entry = entry.ok()?;
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some("log") {
                    Some(path)
                } else {
                    None
                }
            })
            .collect();
        
        // Sort by modification time (newest first)
        log_files.sort_by_key(|path| {
            std::fs::metadata(path)
                .and_then(|m| m.modified())
                .ok()
        });
        
        // Use existing file if available and not too large
        if let Some(latest) = log_files.first() {
            let metadata = std::fs::metadata(latest)?;
            if metadata.len() < config.max_file_size {
                return Ok(latest.to_string_lossy().into_owned());
            }
        }
        
        // Create new log file
        let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
        let log_filename = format!("mcp_audit_{}.log", timestamp);
        let log_path = config.log_directory.join(log_filename);
        
        // Clean up old files if we've exceeded max_files
        if log_files.len() >= config.max_files {
            if let Some(oldest) = log_files.last() {
                std::fs::remove_file(oldest)?;
            }
        }
        
        Ok(log_path.to_string_lossy().into_owned())
    }

    /// Rotate log file if needed
    fn rotate_log_if_needed(&self) -> Result<()> {
        let mut file_size = self.log_file_size.lock().unwrap();
        if *file_size >= self.config.max_file_size {
            drop(file_size);
            let new_file = Self::find_current_log_file(&self.config)?;
            let mut current_file = self.current_log_file.lock().unwrap();
            *current_file = new_file;
            *file_size = 0;
        }
        Ok(())
    }

    /// Log an audit entry
    pub fn log_entry(&self, entry: AuditLogEntry) -> Result<()> {
        self.rotate_log_if_needed()?;
        
        let current_file = self.current_log_file.lock().unwrap();
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&*current_file)?;
        
        let log_line = serde_json::to_string(&entry)? + "\n";
        file.write_all(log_line.as_bytes())?;
        
        // Update file size
        let mut file_size = self.log_file_size.lock().unwrap();
        *file_size += log_line.len() as u64;
        
        Ok(())
    }

    /// Log multiple entries (batch)
    pub fn log_entries(&self, entries: Vec<AuditLogEntry>) -> Result<()> {
        self.rotate_log_if_needed()?;
        
        let current_file = self.current_log_file.lock().unwrap();
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&*current_file)?;
        
        let mut total_bytes = 0;
        for entry in entries {
            let log_line = serde_json::to_string(&entry)? + "\n";
            file.write_all(log_line.as_bytes())?;
            total_bytes += log_line.len();
        }
        
        // Update file size
        let mut file_size = self.log_file_size.lock().unwrap();
        *file_size += total_bytes as u64;
        
        Ok(())
    }

    /// Get current log file path
    pub fn get_current_log_file(&self) -> String {
        self.current_log_file.lock().unwrap().clone()
    }

    /// Search audit logs by criteria
    pub fn search_logs(&self, criteria: &AuditSearchCriteria) -> Result<Vec<AuditLogEntry>> {
        let mut results = Vec::new();
        
        // Read all log files
        for entry in std::fs::read_dir(&self.config.log_directory)? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("log") {
                let file = File::open(&path)?;
                let reader = std::io::BufReader::new(file);
                
                for line in reader.lines() {
                    if let Ok(line) = line {
                        if let Ok(entry) = serde_json::from_str::<AuditLogEntry>(&line) {
                            if criteria.matches(&entry) {
                                results.push(entry);
                            }
                        }
                    }
                }
            }
        }
        
        // Sort by timestamp (newest first)
        results.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        
        Ok(results)
    }
}

/// Criteria for searching audit logs
#[derive(Debug, Clone)]
pub struct AuditSearchCriteria {
    pub request_id: Option<String>,
    pub token_id: Option<String>,
    pub user_id: Option<String>,
    pub tool_name: Option<String>,
    pub status: Option<String>,
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
    pub limit: Option<usize>,
}

impl AuditSearchCriteria {
    pub fn new() -> Self {
        Self {
            request_id: None,
            token_id: None,
            user_id: None,
            tool_name: None,
            status: None,
            start_time: None,
            end_time: None,
            limit: Some(100),
        }
    }

    pub fn matches(&self, entry: &AuditLogEntry) -> bool {
        if let Some(ref req_id) = self.request_id {
            if entry.request_id != *req_id {
                return false;
            }
        }
        
        if let Some(ref tok_id) = self.token_id {
            if entry.token_id.as_ref() != Some(tok_id) {
                return false;
            }
        }
        
        if let Some(ref uid) = self.user_id {
            if entry.user_id.as_ref() != Some(uid) {
                return false;
            }
        }
        
        if let Some(ref tool) = self.tool_name {
            if entry.tool_name.as_ref() != Some(tool) {
                return false;
            }
        }
        
        if let Some(ref stat) = self.status {
            if entry.status != *stat {
                return false;
            }
        }
        
        if let Some(start) = self.start_time {
            if entry.timestamp < start {
                return false;
            }
        }
        
        if let Some(end) = self.end_time {
            if entry.timestamp > end {
                return false;
            }
        }
        
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    
    #[test]
    fn test_audit_logging() {
        let temp_dir = tempdir().unwrap();
        let config = AuditLoggerConfig {
            log_directory: temp_dir.path().to_path_buf(),
            max_file_size: 1024,
            max_files: 3,
            log_level: "info".to_string(),
        };
        
        let logger = AuditLogger::new(config).unwrap();
        
        // Create and log an entry
        let entry = AuditLogEntry::new("req_123", "/mcp", "POST")
            .with_token("token_456", Some("user_789"))
            .with_tool("vault.read")
            .with_success(42)
            .with_client_info("127.0.0.1", "test-client");
        
        logger.log_entry(entry).unwrap();
        
        // Verify log file was created
        let log_file = logger.get_current_log_file();
        assert!(std::path::Path::new(&log_file).exists());
        
        // Search for the entry
        let criteria = AuditSearchCriteria {
            request_id: Some("req_123".to_string()),
            ..Default::default()
        };
        
        let results = logger.search_logs(&criteria).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].request_id, "req_123");
    }
    
    #[test]
    fn test_log_rotation() {
        let temp_dir = tempdir().unwrap();
        let config = AuditLoggerConfig {
            log_directory: temp_dir.path().to_path_buf(),
            max_file_size: 100, // Small size for testing
            max_files: 3,
            log_level: "info".to_string(),
        };
        
        let logger = AuditLogger::new(config).unwrap();
        
        // Create many entries to trigger rotation
        for i in 0..20 {
            let entry = AuditLogEntry::new(&format!("req_{}", i), "/mcp", "POST")
                .with_success(1);
            logger.log_entry(entry).unwrap();
        }
        
        // Should have created multiple log files
        let log_files: Vec<_> = std::fs::read_dir(&logger.config.log_directory)
            .unwrap()
            .filter_map(|e| e.ok())
            .collect();
        
        assert!(log_files.len() > 1, "Should have multiple log files after rotation");
    }
}