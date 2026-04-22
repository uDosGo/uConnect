// WebSocket Subscription System
// Event subscription management for real-time updates

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use serde_json::json;
use anyhow::Result;

/// Subscription manager for WebSocket server
#[derive(Debug, Clone)]
pub struct SubscriptionManager {
    subscriptions: Arc<Mutex<HashMap<String, Subscription>>>,
    event_subscribers: Arc<Mutex<HashMap<String, Vec<String>>>>, // event_type -> subscription_ids
}

impl SubscriptionManager {
    pub fn new() -> Self {
        Self {
            subscriptions: Arc::new(Mutex::new(HashMap::new())),
            event_subscribers: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Create a new subscription
    pub fn create_subscription(
        &self,
        subscription_id: &str,
        event_type: &str,
        filter: Option<serde_json::Value>,
        connection_addr: String,
    ) -> Result<()> {
        let mut subscriptions = self.subscriptions.lock().unwrap();
        let mut event_subscribers = self.event_subscribers.lock().unwrap();
        
        // Create subscription
        let subscription = Subscription {
            id: subscription_id.to_string(),
            event_type: event_type.to_string(),
            filter,
            connection_addr,
            created_at: std::time::SystemTime::now(),
        };
        
        subscriptions.insert(subscription_id.to_string(), subscription);
        
        // Add to event subscribers
        event_subscribers.entry(event_type.to_string())
            .or_insert_with(Vec::new)
            .push(subscription_id.to_string());
        
        Ok(())
    }

    /// Remove a subscription
    pub fn remove_subscription(&self, subscription_id: &str) -> Result<()> {
        let mut subscriptions = self.subscriptions.lock().unwrap();
        let mut event_subscribers = self.event_subscribers.lock().unwrap();
        
        if let Some(subscription) = subscriptions.remove(subscription_id) {
            // Remove from event subscribers
            if let Some(subscribers) = event_subscribers.get_mut(&subscription.event_type) {
                if let Some(pos) = subscribers.iter().position(|s| s == subscription_id) {
                    subscribers.remove(pos);
                }
            }
            Ok(())
        } else {
            Err(anyhow::anyhow!("Subscription {} not found", subscription_id))
        }
    }

    /// Get subscription by ID
    pub fn get_subscription(&self, subscription_id: &str) -> Option<Subscription> {
        self.subscriptions.lock().unwrap()
            .get(subscription_id)
            .cloned()
    }

    /// Get all subscriptions for a connection
    pub fn get_subscriptions_by_connection(&self, connection_addr: &str) -> Vec<Subscription> {
        self.subscriptions.lock().unwrap()
            .values()
            .filter(|s| s.connection_addr == connection_addr)
            .cloned()
            .collect()
    }

    /// Get all subscribers for an event type
    pub fn get_subscribers(&self, event_type: &str) -> Vec<String> {
        self.event_subscribers.lock().unwrap()
            .get(event_type)
            .cloned()
            .unwrap_or_default()
    }

    /// Publish an event to all subscribers
    pub fn publish_event(&self, event_type: &str, event_data: serde_json::Value) -> Result<()> {
        let subscribers = self.get_subscribers(event_type);
        
        for sub_id in subscribers {
            if let Some(subscription) = self.get_subscription(&sub_id) {
                // Check filter if present
                if let Some(filter) = &subscription.filter {
                    if !self.matches_filter(&event_data, filter) {
                        continue;
                    }
                }
                
                // In a real implementation, we would send the event to the connection
                // For now, we'll just log it
                println!("📢 Event {} sent to subscription {}: {:?}", 
                         event_type, sub_id, event_data);
            }
        }
        
        Ok(())
    }

    /// Simple filter matching (key-value equality)
    fn matches_filter(&self, event_data: &serde_json::Value, filter: &serde_json::Value) -> bool {
        if let Some(filter_obj) = filter.as_object() {
            for (key, expected_value) in filter_obj {
                if event_data.get(key) != Some(expected_value) {
                    return false;
                }
            }
            true
        } else {
            true // No filter or invalid filter format - allow through
        }
    }

    /// Clean up subscriptions for disconnected client
    pub fn cleanup_connection(&self, connection_addr: &str) {
        let mut subscriptions = self.subscriptions.lock().unwrap();
        let mut event_subscribers = self.event_subscribers.lock().unwrap();
        
        // Find all subscriptions for this connection
        let subs_to_remove: Vec<String> = subscriptions.values()
            .filter(|s| s.connection_addr == connection_addr)
            .map(|s| s.id.clone())
            .collect();
        
        // Remove them
        for sub_id in subs_to_remove {
            if let Some(subscription) = subscriptions.remove(&sub_id) {
                if let Some(subscribers) = event_subscribers.get_mut(&subscription.event_type) {
                    if let Some(pos) = subscribers.iter().position(|s| s == &sub_id) {
                        subscribers.remove(pos);
                    }
                }
            }
        }
    }

    /// Get subscription count
    pub fn subscription_count(&self) -> usize {
        self.subscriptions.lock().unwrap().len()
    }
}

/// Individual subscription
#[derive(Debug, Clone)]
pub struct Subscription {
    pub id: String,
    pub event_type: String,
    pub filter: Option<serde_json::Value>,
    pub connection_addr: String,
    pub created_at: std::time::SystemTime,
}

impl Subscription {
    /// Get subscription age in seconds
    pub fn age(&self) -> u64 {
        self.created_at
            .elapsed()
            .unwrap_or(std::time::Duration::from_secs(0))
            .as_secs()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_subscription_management() {
        let manager = SubscriptionManager::new();
        
        // Create subscription
        manager.create_subscription(
            "sub_1",
            "feed_updated",
            Some(json!({"feed_id": "main"})),
            "127.0.0.1:12345".to_string(),
        ).unwrap();
        
        // Verify subscription exists
        let sub = manager.get_subscription("sub_1");
        assert!(sub.is_some());
        assert_eq!(sub.unwrap().event_type, "feed_updated");
        
        // Verify subscriber list
        let subscribers = manager.get_subscribers("feed_updated");
        assert!(subscribers.contains(&"sub_1".to_string()));
        
        // Remove subscription
        manager.remove_subscription("sub_1").unwrap();
        assert!(manager.get_subscription("sub_1").is_none());
    }
    
    #[test]
    fn test_event_publishing() {
        let manager = SubscriptionManager::new();
        
        // Create subscription
        manager.create_subscription(
            "sub_1",
            "test_event",
            None,
            "127.0.0.1:12345".to_string(),
        ).unwrap();
        
        // Publish event
        let result = manager.publish_event("test_event", json!({"data": "test"}));
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_filter_matching() {
        let manager = SubscriptionManager::new();
        
        // Create subscription with filter
        manager.create_subscription(
            "sub_1",
            "feed_updated",
            Some(json!({"feed_id": "main", "type": "system"})),
            "127.0.0.1:12345".to_string(),
        ).unwrap();
        
        // Test matching event
        let event1 = json!({
            "feed_id": "main",
            "type": "system",
            "items": 5
        });
        
        // Test non-matching event
        let event2 = json!({
            "feed_id": "other",
            "type": "system",
            "items": 3
        });
        
        // Publish events (in a real test we'd capture output)
        manager.publish_event("feed_updated", event1).unwrap();
        manager.publish_event("feed_updated", event2).unwrap();
    }
    
    #[test]
    fn test_connection_cleanup() {
        let manager = SubscriptionManager::new();
        
        // Create multiple subscriptions for same connection
        manager.create_subscription("sub_1", "event1", None, "127.0.0.1:12345".to_string()).unwrap();
        manager.create_subscription("sub_2", "event2", None, "127.0.0.1:12345".to_string()).unwrap();
        
        assert_eq!(manager.subscription_count(), 2);
        
        // Clean up connection
        manager.cleanup_connection("127.0.0.1:12345");
        
        assert_eq!(manager.subscription_count(), 0);
    }
}