// core-rs/src/background/queue.rs
// Background task queue for autonomous processing

use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, Duration};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use rusqlite::{Connection, params, Result as SqlResult};

/// Background task representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackgroundTask {
    pub id: Uuid,
    pub command: String,
    pub args: Vec<String>,
    pub priority: u8,
    pub created_at: SystemTime,
    pub status: TaskStatus,
    pub retries: u32,
    pub last_error: Option<String>,
}

/// Task status enum
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

/// Background task queue
#[derive(Debug, Clone)]
pub struct TaskQueue {
    db_path: String,
}

impl TaskQueue {
    pub fn new(db_path: &str) -> SqlResult<Self> {
        // Initialize database
        let conn = Connection::open(db_path)?;
        
        // Create tables if they don't exist
        conn.execute(
            "CREATE TABLE IF NOT EXISTS background_tasks (
                id TEXT PRIMARY KEY,
                command TEXT NOT NULL,
                args TEXT NOT NULL,
                priority INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                status TEXT NOT NULL,
                retries INTEGER NOT NULL,
                last_error TEXT
            )",
            [],
        )?;
        
        Ok(Self {
            db_path: db_path.to_string(),
        })
    }

    /// Add a new task to the queue
    pub fn enqueue(&self, command: &str, args: Vec<String>, priority: u8) -> SqlResult<Uuid> {
        let conn = Connection::open(&self.db_path)?;
        let id = Uuid::new_v4();
        let created_at = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        
        conn.execute(
            "INSERT INTO background_tasks (id, command, args, priority, created_at, status, retries) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                id.to_string(),
                command,
                serde_json::to_string(&args).unwrap(),
                priority as i64,
                created_at,
                "pending",
                0,
            ],
        )?;
        
        Ok(id)
    }

    /// Get the next task to execute (highest priority)
    pub fn dequeue(&self) -> SqlResult<Option<BackgroundTask>> {
        let conn = Connection::open(&self.db_path)?;
        
        // Get highest priority pending task
        let mut stmt = conn.prepare(
            "SELECT id, command, args, priority, created_at, status, retries, last_error 
             FROM background_tasks 
             WHERE status = 'pending' 
             ORDER BY priority DESC 
             LIMIT 1"
        )?;
        
        let task = stmt.query_row([], |row| {
            Ok(BackgroundTask {
                id: Uuid::parse_str(row.get(0)?).unwrap(),
                command: row.get(1)?,
                args: serde_json::from_str(row.get(2)?).unwrap(),
                priority: row.get(3)?,
                created_at: SystemTime::UNIX_EPOCH + Duration::from_secs(row.get(4)? as u64),
                status: match row.get(5)? {
                    "pending" => TaskStatus::Pending,
                    "running" => TaskStatus::Running,
                    "completed" => TaskStatus::Completed,
                    "failed" => TaskStatus::Failed,
                    "cancelled" => TaskStatus::Cancelled,
                    _ => TaskStatus::Pending,
                },
                retries: row.get(6)?,
                last_error: row.get(7),
            })
        });
        
        match task {
            Ok(task) => Ok(Some(task)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    /// Mark task as completed
    pub fn complete(&self, task_id: Uuid) -> SqlResult<bool> {
        let conn = Connection::open(&self.db_path)?;
        let rows_affected = conn.execute(
            "UPDATE background_tasks SET status = 'completed' WHERE id = ?1",
            params![task_id.to_string()],
        )?;
        
        Ok(rows_affected > 0)
    }

    /// Mark task as failed and increment retries
    pub fn fail(&self, task_id: Uuid, error: String) -> SqlResult<bool> {
        let conn = Connection::open(&self.db_path)?;
        
        // Get current task
        let mut stmt = conn.prepare(
            "SELECT retries FROM background_tasks WHERE id = ?1"
        )?;
        
        let current_retries: i32 = stmt.query_row(params![task_id.to_string()], |row| {
            Ok(row.get(0)?)
        }).optional()?.unwrap_or(0);
        
        if current_retries >= 2 {
            // Max retries exceeded, remove task
            conn.execute(
                "DELETE FROM background_tasks WHERE id = ?1",
                params![task_id.to_string()],
            )?;
            return Ok(false);
        }
        
        // Update task with new retry count and error
        conn.execute(
            "UPDATE background_tasks SET status = 'failed', retries = retries + 1, last_error = ?1 WHERE id = ?2",
            params![error, task_id.to_string()],
        )?;
        
        Ok(true)
    }

    /// Get all tasks
    pub fn list_tasks(&self) -> SqlResult<Vec<BackgroundTask>> {
        let conn = Connection::open(&self.db_path)?;
        let mut stmt = conn.prepare(
            "SELECT id, command, args, priority, created_at, status, retries, last_error 
             FROM background_tasks 
             ORDER BY created_at DESC"
        )?;
        
        let tasks = stmt.query_map([], |row| {
            Ok(BackgroundTask {
                id: Uuid::parse_str(row.get(0)?).unwrap(),
                command: row.get(1)?,
                args: serde_json::from_str(row.get(2)?).unwrap(),
                priority: row.get(3)?,
                created_at: SystemTime::UNIX_EPOCH + Duration::from_secs(row.get(4)? as u64),
                status: match row.get(5)? {
                    "pending" => TaskStatus::Pending,
                    "running" => TaskStatus::Running,
                    "completed" => TaskStatus::Completed,
                    "failed" => TaskStatus::Failed,
                    "cancelled" => TaskStatus::Cancelled,
                    _ => TaskStatus::Pending,
                },
                retries: row.get(6)?,
                last_error: row.get(7),
            })
        })?;
        
        tasks.collect()
    }

    /// Get pending tasks count
    pub fn pending_count(&self) -> SqlResult<usize> {
        let conn = Connection::open(&self.db_path)?;
        let count: usize = conn.query_row(
            "SELECT COUNT(*) FROM background_tasks WHERE status = 'pending'",
            [],
            |row| Ok(row.get(0)?)
        )?;
        
        Ok(count)
    }

    /// Clear completed tasks older than 24 hours
    pub fn cleanup(&self) -> SqlResult<usize> {
        let conn = Connection::open(&self.db_path)?;
        let cutoff = SystemTime::now() - Duration::from_secs(86400);
        let cutoff_timestamp = cutoff
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        
        let count = conn.query_row(
            "SELECT COUNT(*) FROM background_tasks WHERE status = 'completed' AND created_at < ?1",
            params![cutoff_timestamp],
            |row| Ok(row.get(0)?)
        )?;
        
        conn.execute(
            "DELETE FROM background_tasks WHERE status = 'completed' AND created_at < ?1",
            params![cutoff_timestamp],
        )?;
        
        Ok(count)
    }
}

/// Background task processor
pub struct TaskProcessor {
    queue: TaskQueue,
    running: Arc<Mutex<bool>>,
}

impl TaskProcessor {
    pub fn new(queue: TaskQueue) -> Self {
        Self {
            queue,
            running: Arc::new(Mutex::new(false)),
        }
    }

    /// Process tasks in the background
    pub fn process(&self) {
        let mut running = self.running.lock().unwrap();
        if *running {
            return;
        }
        *running = true;
        drop(running);

        // Process in background thread
        std::thread::spawn({
            let queue = self.queue.clone();
            let running = self.running.clone();
            move || {
                while let Some(task) = queue.dequeue() {
                    // Execute the task
                    let result = execute_task(&task);
                    
                    if result.is_ok() {
                        queue.complete(task.id);
                    } else {
                        queue.fail(task.id, result.err().unwrap_or_default());
                    }
                }
                
                let mut running = running.lock().unwrap();
                *running = false;
            }
        });
    }
}

/// Execute a background task
fn execute_task(task: &BackgroundTask) -> Result<(), String> {
    // This would call the appropriate command handler
    // For now, we'll simulate execution
    std::thread::sleep(Duration::from_millis(100));
    
    if task.command.contains("fail") {
        Err("Simulated failure".to_string())
    } else {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread::sleep;
    use std::time::Duration;

    #[test]
    fn test_task_queue() {
        let queue = TaskQueue::new();
        
        // Add tasks with different priorities
        let id1 = queue.enqueue("test1", vec![], 1);
        let id2 = queue.enqueue("test2", vec![], 3);
        let id3 = queue.enqueue("test3", vec![], 2);
        
        // Should get highest priority first
        let next = queue.dequeue().unwrap();
        assert_eq!(next.id, id2); // Priority 3
        
        // Then medium priority
        let next = queue.dequeue().unwrap();
        assert_eq!(next.id, id3); // Priority 2
        
        // Then lowest priority
        let next = queue.dequeue().unwrap();
        assert_eq!(next.id, id1); // Priority 1
    }

    #[test]
    fn test_task_completion() {
        let queue = TaskQueue::new();
        let id = queue.enqueue("test", vec![], 1);
        
        let task = queue.dequeue().unwrap();
        assert_eq!(task.status, TaskStatus::Pending);
        
        queue.complete(id);
        assert_eq!(queue.pending_count(), 0);
    }

    #[test]
    fn test_task_failure_and_retry() {
        let queue = TaskQueue::new();
        let id = queue.enqueue("test", vec![], 1);
        
        let task = queue.dequeue().unwrap();
        queue.fail(id, "Test error".to_string());
        
        // Should be back in queue with retry count incremented
        let retried = queue.dequeue().unwrap();
        assert_eq!(retried.retries, 1);
        assert_eq!(retried.last_error, Some("Test error".to_string()));
    }

    #[test]
    fn test_max_retries() {
        let queue = TaskQueue::new();
        let id = queue.enqueue("test", vec![], 1);
        
        // Fail 3 times
        for _ in 0..3 {
            let task = queue.dequeue().unwrap();
            queue.fail(id, "Error".to_string());
        }
        
        // Should not be in queue anymore
        assert!(queue.dequeue().is_none());
    }
}