---
name: Test Coverage
description: Ensure test coverage > 80% for Python and Rust code
type: check
---

## Python (uCode1)

```bash
cd uCode1 && python -m pytest tests/ -v --tb=short --cov=core_py --cov=narrator --cov-report=term-missing
```

Fail if coverage < 80%.

## Rust (uCode2)

```bash
cd uCode2 && cargo tarpaulin --workspace --out Xml --skip-clean
```

Fail if coverage < 75%.
