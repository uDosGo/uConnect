// MCP Authentication Middleware
// Request validation and rate limiting for MCP endpoints

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use anyhow::{Result, anyhow};
use serde_json::json;

use super::tokens::{McpToken, TokenType};
use super::permissions::PermissionChecker;

/// Rate limiting configuration
#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    pub tokens: u32,           // Max tokens
    pub refill_rate: u32,       // Tokens per second
    pub burst_capacity: u32,    // Max burst size
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            tokens: 100,      // 100 requests
            refill_rate: 1,   // 1 token per second
            burst_capacity: 10,
        }
    }
}

/// Rate limit state for a single client
#[derive(Debug)]
struct RateLimitState {
    tokens: u32,
    last_refill: u64,
}

/// Authentication middleware for MCP
#[derive(Debug, Clone)]
pub struct AuthMiddleware {
    secret: String,
    permission_checker: PermissionChecker,
    rate_limits: Arc<Mutex<HashMap<String, RateLimitState>>>, // token_id -> state
    config: RateLimitConfig,
    auth_required: bool, // Allow disabling for local development
}

impl AuthMiddleware {
    pub fn new(secret: &str, auth_required: bool) -> Self {
        Self {
            secret: secret.to_string(),
            permission_checker: PermissionChecker::with_defaults(),
            rate_limits: Arc::new(Mutex::new(HashMap::new())),
            config: RateLimitConfig::default(),
            auth_required,
        }
    }

    /// Set custom rate limit configuration
    pub fn with_rate_limit(mut self, config: RateLimitConfig) -> Self {
        self.config = config;
        self
    }

    /// Authenticate and validate a request
    pub fn authenticate(&self, token: Option<&str>, tool_name: &str) -> Result<()> {
        // Skip authentication if not required (local development)
        if !self.auth_required {
            if token.is_none() {
                println!("⚠️  Authentication disabled - allowing unauthenticated access");
            }
            return Ok(());
        }
        
        // Require token
        let token = token.ok_or_else(|| anyhow!("Authentication required"))?;
        
        // Parse and validate token
        let mcp_token = McpToken::parse(&self.secret, token)?;
        mcp_token.validate()?;
        
        // Extract token ID for rate limiting
        let token_id = mcp_token.claims.token_id.clone();
        
        // Check rate limit
        self.check_rate_limit(&token_id)?;
        
        // Check permissions
        let role = match mcp_token.claims.token_type {
            TokenType::Api => "user", // API keys get user role by default
            TokenType::Session => mcp_token.claims.user_id.as_deref().unwrap_or("guest"),
            TokenType::Service => "service",
        };
        
        if !self.permission_checker.can_access_tool(role, tool_name)? {
            return Err(anyhow!("Insufficient permissions for tool: {}", tool_name));
        }
        
        Ok(())
    }

    /// Check rate limit for a token
    fn check_rate_limit(&self, token_id: &str) -> Result<()> {
        let mut rate_limits = self.rate_limits.lock().unwrap();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        // Get or create rate limit state
        let state = rate_limits.entry(token_id.to_string())
            .or_insert(RateLimitState {
                tokens: self.config.tokens,
                last_refill: now,
            });
        
        // Refill tokens based on time passed
        let time_passed = now - state.last_refill;
        if time_passed > 0 {
            let tokens_to_add = (time_passed as u32) * self.config.refill_rate;
            state.tokens = state.tokens.saturating_add(tokens_to_add);
            state.last_refill = now;
            
            // Cap at burst capacity
            if state.tokens > self.config.burst_capacity {
                state.tokens = self.config.burst_capacity;
            }
        }
        
        // Check if tokens available
        if state.tokens == 0 {
            return Err(anyhow!("Rate limit exceeded"));
        }
        
        // Consume token
        state.tokens = state.tokens.saturating_sub(1);
        
        Ok(())
    }

    /// Get current rate limit status
    pub fn get_rate_limit_status(&self, token_id: &str) -> (u32, u32) {
        let rate_limits = self.rate_limits.lock().unwrap();
        let state = rate_limits.get(token_id);
        
        match state {
            Some(s) => (s.tokens, self.config.tokens),
            None => (self.config.tokens, self.config.tokens),
        }
    }

    /// Reset rate limit for a token (for testing)
    pub fn reset_rate_limit(&self, token_id: &str) {
        let mut rate_limits = self.rate_limits.lock().unwrap();
        rate_limits.remove(token_id);
    }

    /// Generate a new token for testing
    pub fn generate_test_token(&self, token_type: TokenType, token_id: &str) -> Result<String> {
        McpToken::generate(
            &self.secret,
            token_type,
            token_id,
            Some("test_user".to_string()),
            vec!["read".to_string(), "write".to_string()],
            Some(3600), // 1 hour
        ).map(|t| t.raw)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_authentication_required() {
        let middleware = AuthMiddleware::new("test_secret", true);
        
        // Should fail without token
        let result = middleware.authenticate(None, "vault.read");
        assert!(result.is_err());
        
        // Should work with valid token
        let token = middleware.generate_test_token(TokenType::Api, "test_token").unwrap();
        let result = middleware.authenticate(Some(&token), "vault.read");
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_authentication_disabled() {
        let middleware = AuthMiddleware::new("test_secret", false);
        
        // Should work without token when auth disabled
        let result = middleware.authenticate(None, "vault.read");
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_rate_limiting() {
        let middleware = AuthMiddleware::new("test_secret", true)
            .with_rate_limit(RateLimitConfig {
                tokens: 2,
                refill_rate: 1,
                burst_capacity: 2,
            });
        
        let token = middleware.generate_test_token(TokenType::Api, "rate_test").unwrap();
        
        // First two requests should work
        assert!(middleware.authenticate(Some(&token), "vault.read").is_ok());
        assert!(middleware.authenticate(Some(&token), "vault.read").is_ok());
        
        // Third request should be rate limited
        assert!(middleware.authenticate(Some(&token), "vault.read").is_err());
        
        // Reset and try again
        middleware.reset_rate_limit("rate_test");
        assert!(middleware.authenticate(Some(&token), "vault.read").is_ok());
    }
    
    #[test]
    fn test_permission_denied() {
        let middleware = AuthMiddleware::new("test_secret", true);
        let token = middleware.generate_test_token(TokenType::Api, "perm_test").unwrap();
        
        // Should work for allowed tool
        assert!(middleware.authenticate(Some(&token), "vault.read").is_ok());
        
        // Should fail for admin-only tool
        let result = middleware.authenticate(Some(&token), "swarm_create");
        assert!(result.is_err());
    }
}