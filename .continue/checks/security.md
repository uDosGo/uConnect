---
name: Security Scan
description: Run OWASP dependency check and audit for vulnerabilities
type: check
---

## Python Dependencies

```bash
cd uCode1 && pip-audit --requirement requirements.txt
```

## Rust Dependencies

```bash
cd uCode2 && cargo audit
```

## Node Dependencies

```bash
cd uCode2/ThinUI && npm audit --audit-level=high
```
