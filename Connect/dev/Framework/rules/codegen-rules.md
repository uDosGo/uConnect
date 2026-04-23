# Code Generation Rules for Mastra Agents

## Style Rules
- Use TypeScript with strict mode
- Prefer `const` over `let` where possible
- Use descriptive variable names (no `x`, `y`, `tmp`)
- Add JSDoc comments for public functions
- Include error handling (try/catch for async)

## Security Rules
- Never generate code with `eval()`
- Never hardcode API keys or secrets
- Always validate user input
- Use parameterized queries for databases

## Format Rules
- 2 space indentation
- Trailing commas in objects/arrays
- Single quotes for strings
- Semicolons required
- Max line length 100

## Example Good Generation

```typescript
/**
 * Validates an email address format
 * @param email - The email string to validate
 * @returns True if email format is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```