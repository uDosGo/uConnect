// MCP Permission System
// Role-based access control for MCP tools

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use anyhow::{Result, anyhow};

/// Predefined roles and their permissions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub name: String,
    pub description: String,
    pub permissions: Vec<String>,
    pub inherit_from: Option<String>, // Parent role to inherit from
}

impl Role {
    pub fn new(name: &str, description: &str, permissions: Vec<String>) -> Self {
        Self {
            name: name.to_string(),
            description: description.to_string(),
            permissions,
            inherit_from: None,
        }
    }

    pub fn with_inheritance(mut self, parent_role: &str) -> Self {
        self.inherit_from = Some(parent_role.to_string());
        self
    }
}

/// Permission checker for MCP tools
#[derive(Debug, Clone)]
pub struct PermissionChecker {
    roles: HashMap<String, Role>,
    tool_permissions: HashMap<String, Vec<String>>, // tool_name -> required_permissions
}

impl PermissionChecker {
    pub fn new() -> Self {
        Self {
            roles: HashMap::new(),
            tool_permissions: HashMap::new(),
        }
    }

    /// Initialize with default roles and permissions
    pub fn with_defaults() -> Self {
        let mut checker = Self::new();
        
        // Define default roles
        let admin_role = Role::new(
            "admin",
            "Full access to all tools and administrative functions",
            vec!["*.*"], // Wildcard permission
        );
        
        let user_role = Role::new(
            "user",
            "Standard user with access to most tools",
            vec![
                "vault.*",
                "feed.*",
                "spool.*",
                "publish.*",
                "grid.*",
                "usxd.*",
                "diagram.*",
                "markdownify.*",
                "sync.status",
                "lechat.query",
            ],
        );
        
        let guest_role = Role::new(
            "guest",
            "Read-only access to safe tools",
            vec![
                "vault.read",
                "vault.list",
                "feed.list",
                "feed.view",
                "spool.list",
                "diagram.banner",
                "diagram.fonts.list",
            ],
        );
        
        let service_role = Role::new(
            "service",
            "Machine-to-machine access for specific tools",
            vec![
                "vault.read",
                "vault.write",
                "feed.pull",
                "sync.push",
                "sync.pull",
            ],
        );
        
        // Add roles
        checker.roles.insert("admin".to_string(), admin_role);
        checker.roles.insert("user".to_string(), user_role);
        checker.roles.insert("guest".to_string(), guest_role);
        checker.roles.insert("service".to_string(), service_role);
        
        // Define tool permissions
        checker.tool_permissions.insert("vault.read".to_string(), vec!["vault.read"]);
        checker.tool_permissions.insert("vault.write".to_string(), vec!["vault.write"]);
        checker.tool_permissions.insert("feed.list".to_string(), vec!["feed.list"]);
        checker.tool_permissions.insert("swarm_create".to_string(), vec!["swarm.create"]);
        checker.tool_permissions.insert("secret_get".to_string(), vec!["secret.get"]);
        
        checker
    }

    /// Check if a role has permission for a specific tool
    pub fn can_access_tool(&self, role_name: &str, tool_name: &str) -> Result<bool> {
        // Get the role
        let role = self.roles.get(role_name)
            .ok_or_else(|| anyhow!("Role {} not found", role_name))?;
        
        // Get required permissions for the tool
        let required_permissions = self.tool_permissions.get(tool_name)
            .ok_or_else(|| anyhow!("Tool {} not found in permissions", tool_name))?;
        
        // Check each required permission
        for perm in required_permissions {
            if !self.check_permission(role, perm) {
                return Ok(false);
            }
        }
        
        Ok(true)
    }

    /// Check if a role has a specific permission
    fn check_permission(&self, role: &Role, permission: &str) -> bool {
        // Check for wildcard permission
        if role.permissions.contains(&"*.*".to_string()) {
            return true;
        }
        
        // Check for exact match
        if role.permissions.contains(&permission.to_string()) {
            return true;
        }
        
        // Check for wildcard patterns (e.g., "vault.*" matches "vault.read")
        for role_perm in &role.permissions {
            if role_perm.ends_with(".*") {
                let prefix = role_perm.trim_end_matches(".*");
                if permission.starts_with(prefix) {
                    return true;
                }
            }
        }
        
        false
    }

    /// Add a custom role
    pub fn add_role(&mut self, role: Role) {
        self.roles.insert(role.name.clone(), role);
    }

    /// Add permissions for a tool
    pub fn add_tool_permissions(&mut self, tool_name: &str, permissions: Vec<String>) {
        self.tool_permissions.insert(tool_name.to_string(), permissions);
    }

    /// Get all permissions for a role (including inherited)
    pub fn get_all_permissions(&self, role_name: &str) -> Result<Vec<String>> {
        let mut permissions = Vec::new();
        let mut current_role = self.roles.get(role_name)
            .ok_or_else(|| anyhow!("Role {} not found", role_name))?;
        
        // Collect permissions from role hierarchy
        let mut visited_roles = Vec::new();
        while let Some(role) = current_role {
            if visited_roles.contains(&role.name) {
                return Err(anyhow!("Circular role inheritance detected"));
            }
            visited_roles.push(role.name.clone());
            
            // Add current role's permissions
            for perm in &role.permissions {
                if !permissions.contains(perm) {
                    permissions.push(perm.clone());
                }
            }
            
            // Move to parent role if exists
            current_role = role.inherit_from.as_ref()
                .and_then(|parent_name| self.roles.get(parent_name));
        }
        
        Ok(permissions)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_default_permissions() {
        let checker = PermissionChecker::with_defaults();
        
        // Admin can access everything
        assert!(checker.can_access_tool("admin", "vault.read").unwrap());
        assert!(checker.can_access_tool("admin", "swarm_create").unwrap());
        
        // User can access user tools
        assert!(checker.can_access_tool("user", "vault.read").unwrap());
        assert!(checker.can_access_tool("user", "feed.list").unwrap());
        
        // Guest has limited access
        assert!(checker.can_access_tool("guest", "vault.read").unwrap());
        assert!(!checker.can_access_tool("guest", "vault.write").unwrap());
        
        // Service role access
        assert!(checker.can_access_tool("service", "sync.push").unwrap());
        assert!(!checker.can_access_tool("service", "swarm_create").unwrap());
    }
    
    #[test]
    fn test_wildcard_permissions() {
        let mut checker = PermissionChecker::new();
        
        // Add a role with wildcard permission
        let admin_role = Role::new("admin", "Admin role", vec!["*.*"]);
        checker.add_role(admin_role);
        
        // Add tool permissions
        checker.add_tool_permissions("test_tool", vec!["test.permission"]);
        
        // Admin should have access to everything
        assert!(checker.can_access_tool("admin", "test_tool").unwrap());
    }
    
    #[test]
    fn test_permission_inheritance() {
        let mut checker = PermissionChecker::new();
        
        // Create parent role
        let parent_role = Role::new("parent", "Parent role", vec!["base.permission"]);
        checker.add_role(parent_role);
        
        // Create child role that inherits from parent
        let child_role = Role::new("child", "Child role", vec!["child.permission"])
            .with_inheritance("parent");
        checker.add_role(child_role);
        
        // Add tool that requires base permission
        checker.add_tool_permissions("inherited_tool", vec!["base.permission"]);
        
        // Child should inherit parent's permissions
        assert!(checker.can_access_tool("child", "inherited_tool").unwrap());
        
        // Verify all permissions are collected
        let all_perms = checker.get_all_permissions("child").unwrap();
        assert!(all_perms.contains(&"base.permission".to_string()));
        assert!(all_perms.contains(&"child.permission".to_string()));
    }
}