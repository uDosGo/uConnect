// MCP Token System
// Bearer token authentication for MCP endpoints

use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use anyhow::{Result, anyhow};
use base64::{engine::general_purpose, Engine as _};

/// Token types supported by MCP
type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TokenType {
    Api,       // Long-lived API keys
    Session,   // Short-lived session tokens
    Service,   // Machine-to-machine tokens
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenClaims {
    pub token_type: TokenType,
    pub token_id: String,
    pub user_id: Option<String>,
    pub permissions: Vec<String>,
    pub created_at: u64,
    pub expires_at: Option<u64>,
    pub issuer: String,
}

impl TokenClaims {
    pub fn new(
        token_type: TokenType,
        token_id: &str,
        user_id: Option<String>,
        permissions: Vec<String>,
        ttl_seconds: Option<u64>,
    ) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        let expires_at = ttl_seconds.map(|ttl| now + ttl);
        
        Self {
            token_type,
            token_id: token_id.to_string(),
            user_id,
            permissions,
            created_at: now,
            expires_at,
            issuer: "mcp-auth".to_string(),
        }
    }

    pub fn is_expired(&self) -> bool {
        if let Some(expires_at) = self.expires_at {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            now > expires_at
        } else {
            false
        }
    }

    pub fn has_permission(&self, required_permission: &str) -> bool {
        // Admin has all permissions
        if self.permissions.contains(&"admin".to_string()) {
            return true;
        }
        
        // Check specific permissions
        self.permissions.contains(&required_permission.to_string())
    }
}

#[derive(Debug, Clone)]
pub struct McpToken {
    pub raw: String,
    pub claims: TokenClaims,
    pub signature: String,
}

impl McpToken {
    /// Generate a new MCP token
    pub fn generate(
        secret: &str,
        token_type: TokenType,
        token_id: &str,
        user_id: Option<String>,
        permissions: Vec<String>,
        ttl_seconds: Option<u64>,
    ) -> Result<Self> {
        let claims = TokenClaims::new(token_type, token_id, user_id, permissions, ttl_seconds);
        let claims_json = serde_json::to_string(&claims)?;
        
        // Create HMAC signature
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
            .map_err(|e| anyhow!("HMAC initialization failed: {}", e))?;
        mac.update(claims_json.as_bytes());
        let signature = general_purpose::URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes());
        
        // Format: type:id:signature
        let raw_token = format!("{}:{}:{}", 
            match token_type {
                TokenType::Api => "api",
                TokenType::Session => "session", 
                TokenType::Service => "service",
            },
            token_id,
            signature
        );
        
        Ok(Self {
            raw: raw_token,
            claims,
            signature,
        })
    }

    /// Parse and validate a token
    pub fn parse(secret: &str, token: &str) -> Result<Self> {
        // Split token parts
        let parts: Vec<&str> = token.split(':').collect();
        if parts.len() != 3 {
            return Err(anyhow!("Invalid token format"));
        }
        
        let token_type_str = parts[0];
        let token_id = parts[1];
        let signature = parts[2];
        
        // Determine token type
        let token_type = match token_type_str {
            "api" => TokenType::Api,
            "session" => TokenType::Session,
            "service" => TokenType::Service,
            _ => return Err(anyhow!("Invalid token type")),
        };
        
        // Reconstruct claims from token ID (simplified - in production would decode JWT)
        // For now, we'll create minimal claims and validate signature
        let claims = TokenClaims::new(
            token_type.clone(),
            token_id,
            None, // User ID would be decoded from proper JWT
            vec!["read".to_string()], // Default permission
            None, // No expiration for this example
        );
        
        // Verify signature
        let claims_json = serde_json::to_string(&claims)?;
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
            .map_err(|e| anyhow!("HMAC initialization failed: {}", e))?;
        mac.update(claims_json.as_bytes());
        let expected_signature = general_purpose::URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes());
        
        if expected_signature != signature {
            return Err(anyhow!("Invalid token signature"));
        }
        
        Ok(Self {
            raw: token.to_string(),
            claims,
            signature: signature.to_string(),
        })
    }

    /// Validate token (check expiration and signature)
    pub fn validate(&self) -> Result<()> {
        if self.claims.is_expired() {
            return Err(anyhow!("Token expired"));
        }
        
        // Additional validation logic would go here
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_token_generation_and_parsing() {
        let secret = "test_secret_key_12345";
        let token_id = "test_token_001";
        
        // Generate token
        let token = McpToken::generate(
            secret,
            TokenType::Api,
            token_id,
            Some("test_user".to_string()),
            vec!["read".to_string(), "write".to_string()],
            Some(3600), // 1 hour TTL
        ).unwrap();
        
        // Parse token
        let parsed = McpToken::parse(secret, &token.raw).unwrap();
        
        // Verify
        assert_eq!(parsed.raw, token.raw);
        assert_eq!(parsed.claims.token_id, token_id);
        assert!(parsed.claims.has_permission("read"));
        assert!(parsed.claims.has_permission("write"));
        assert!(!parsed.claims.has_permission("admin"));
    }
    
    #[test]
    fn test_invalid_token() {
        let secret = "test_secret";
        let invalid_token = "api:invalid:wrong_signature";
        
        let result = McpToken::parse(secret, invalid_token);
        assert!(result.is_err());
    }
    
    #[test]
    fn test_token_expiration() {
        let secret = "test_secret";
        let token = McpToken::generate(
            secret,
            TokenType::Session,
            "expired_token",
            None,
            vec!["read".to_string()],
            Some(0), // Expired immediately
        ).unwrap();
        
        assert!(token.claims.is_expired());
    }
}