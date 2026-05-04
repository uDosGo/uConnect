# Security Rules for All Code

## API Keys
- Never commit `.env` files
- Use `sonic config set` for secrets
- Rotate keys every 90 days

## Input Validation
- All user input must be validated
- Shell commands must use `execFile` not `exec`
- File paths must be resolved and checked for traversal

## Container Safety
- Never run containers as root
- Use read-only volumes where possible
- Set resource limits (CPU, memory)

## Logging
- Never log API keys or passwords
- Sanitize user input before logging
- Use structured logs with levels