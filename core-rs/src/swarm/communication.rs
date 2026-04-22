// core-rs/src/swarm/communication.rs
// Inter-agent communication system

use super::agent::{AgentMessage, AgentType};
use std::collections::HashMap;
use uuid::Uuid;

/// Communication bus for inter-agent messaging
pub struct CommunicationBus {
    channels: HashMap<AgentType, Vec<AgentMessage>>,
}

impl CommunicationBus {
    pub fn new() -> Self {
        Self {
            channels: HashMap::new(),
        }
    }

    /// Send a message to a specific agent
    pub fn send(&mut self, to: AgentType, message: AgentMessage) {
        self.channels.entry(to).or_insert_with(Vec::new).push(message);
    }

    /// Receive messages for an agent
    pub fn receive(&mut self, agent: AgentType) -> Vec<AgentMessage> {
        self.channels.remove(&agent).unwrap_or_default()
    }

    /// Broadcast message to all agents
    pub fn broadcast(&mut self, message: AgentMessage) {
        for agents in self.channels.values_mut() {
            agents.push(message.clone());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::super::agent::{TaskType, AgentOutput};
    use uuid::Uuid;

    #[test]
    fn test_communication_bus() {
        let mut bus = CommunicationBus::new();
        
        let message = AgentMessage {
            task_id: Uuid::new_v4(),
            task_type: TaskType::Generate,
            content: serde_json::json!({"prompt": "test"}),
        };
        
        bus.send(AgentType::DSC2, message.clone());
        let received = bus.receive(AgentType::DSC2);
        
        assert_eq!(received.len(), 1);
        assert_eq!(received[0].task_type, TaskType::Generate);
    }
}