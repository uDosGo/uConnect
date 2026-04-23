# Python Execution Patterns

## Virtual Environment Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Script Template

```python
#!/usr/bin/env python3
"""
Script: {{name}}
Description: {{description}}
"""
import sys
import os
from pathlib import Path

def main():
    """Main execution function"""
    try:
        # Implementation here
        print("✅ Success")
        return 0
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

## Best Practices
- Use `pathlib` for cross-platform paths
- Always use `if __name__ == "__main__":`
- Return proper exit codes
- Log to stderr for errors
