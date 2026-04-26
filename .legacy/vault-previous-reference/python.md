# Python Execution Patterns

## 🐍 Python Best Practices

This document outlines recommended Python execution patterns for Sonic Family projects.

## 📦 Virtual Environment Setup

### Basic Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Linux/Mac)
source .venv/bin/activate

# Activate (Windows)
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Freeze dependencies
pip freeze > requirements.txt
```

### Advanced Setup with pip-tools

```bash
# Install pip-tools
pip install pip-tools

# Compile requirements
pip-compile requirements.in

# Install compiled requirements
pip-sync requirements.txt
```

## 📜 Script Template

### Standard Script Structure

```python
#!/usr/bin/env python3
"""
Script: {{name}}
Description: {{description}}
Author: {{author}}
Date: {{date}}
"""
import sys
import os
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main(argv: Optional[List[str]] = None) -> int:
    """
    Main execution function.
    
    Args:
        argv: Command line arguments
        
    Returns:
        int: Exit code (0 for success, non-zero for error)
    """
    try:
        # Parse arguments
        args = parse_arguments(argv)
        
        # Validate input
        validate_input(args)
        
        # Execute main logic
        result = execute(args)
        
        # Log success
        logger.info("✅ Operation completed successfully")
        
        return 0
        
    except Exception as e:
        # Log error
        logger.error(f"❌ Error: {e}")
        
        # Print to stderr
        print(f"Error: {e}", file=sys.stderr)
        
        return 1

def parse_arguments(argv: Optional[List[str]]) -> Any:
    """Parse command line arguments."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description={{description | quote}},
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    # Add arguments here
    parser.add_argument(
        '--input',
        type=str,
        help='Input file path'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        default='output.txt',
        help='Output file path (default: output.txt)'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    return parser.parse_args(argv)

def validate_input(args: Any) -> None:
    """Validate input arguments."""
    if args.input and not Path(args.input).exists():
        raise FileNotFoundError(f"Input file not found: {args.input}")
    
    if not Path(args.output).parent.exists():
        raise FileNotFoundError(f"Output directory not found: {Path(args.output).parent}")

def execute(args: Any) -> Any:
    """Execute main logic."""
    # Implementation goes here
    logger.info(f"Processing {args.input} -> {args.output}")
    
    # Example: Read input file
    if args.input:
        content = Path(args.input).read_text()
        logger.debug(f"Read {len(content)} characters from {args.input}")
    
    # Example: Write output file
    output_path = Path(args.output)
    output_path.write_text("Sample output\n")
    logger.info(f"Wrote output to {output_path}")
    
    return {"status": "success", "output": str(output_path)}

if __name__ == "__main__":
    # Execute with command line arguments
    sys.exit(main())
```

## 🎯 Best Practices

### 1. Path Handling

**Use `pathlib` for cross-platform paths:**

```python
from pathlib import Path

# Good
config_path = Path.home() / ".config" / "app" / "config.json"

# Bad
config_path = "/home/user/.config/app/config.json"
```

### 2. Error Handling

**Always use proper error handling:**

```python
# Good
try:
    with open(file, 'r') as f:
        content = f.read()
except FileNotFoundError as e:
    logger.error(f"File not found: {file}")
    raise

# Bad
content = open(file, 'r').read()
```

### 3. Main Guard

**Always use `if __name__ == "__main__":`:**

```python
# Good
def main():
    pass

if __name__ == "__main__":
    main()

# Bad
main()
```

### 4. Exit Codes

**Return proper exit codes:**

```python
# Good
def main():
    try:
        # ...
        return 0  # Success
    except Exception:
        return 1  # Error

# Bad
def main():
    # ...
    # No explicit return
```

### 5. Logging

**Log to both file and console:**

```python
# Good
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

# Bad
print("Starting...")
```

### 6. Type Hints

**Use type hints for better code clarity:**

```python
# Good
def process_data(data: List[Dict[str, Any]]) -> Dict[str, int]:
    pass

# Bad
def process_data(data):
    pass
```

### 7. Configuration

**Use environment variables for configuration:**

```python
# Good
import os
API_KEY = os.getenv('API_KEY', 'default-key')

# Bad
API_KEY = 'hardcoded-key'
```

### 8. Dependency Management

**Pin dependencies in requirements.txt:**

```text
# Good
requests==2.28.1
click==8.1.3

# Bad
requests
click
```

## 📚 Common Patterns

### 1. File Processing

```python
from pathlib import Path

def process_files(input_dir: Path, output_dir: Path) -> None:
    """Process all files in input directory."""
    output_dir.mkdir(exist_ok=True)
    
    for input_file in input_dir.glob("*.txt"):
        output_file = output_dir / f"processed_{input_file.name}"
        
        # Process file
        content = input_file.read_text()
        processed = content.upper()
        
        # Write output
        output_file.write_text(processed)
        
        logger.info(f"Processed {input_file} -> {output_file}")
```

### 2. API Client

```python
import requests
from typing import Optional, Dict, Any

class APIClient:
    """API client with retry logic."""
    
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers['Authorization'] = f'Bearer {api_key}'
    
    def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make GET request to API."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            raise
```

### 3. Data Validation

```python
from pydantic import BaseModel, ValidationError

class UserCreate(BaseModel):
    """User creation schema."""
    username: str
    email: str
    age: int
    
    @validator('email')
    def valid_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email')
        return v
    
    @validator('age')
    def valid_age(cls, v):
        if v < 18:
            raise ValueError('Must be 18+')
        return v

def create_user(data: dict) -> UserCreate:
    """Create user with validation."""
    try:
        return UserCreate(**data)
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise
```

## 🛡️ Security Best Practices

### 1. Input Validation

```python
# Good
import re

def validate_email(email: str) -> bool:
    pattern = r'^[^@]+@[^@]+\.[^@]+$'
    return bool(re.match(pattern, email))

# Bad
def validate_email(email: str) -> bool:
    return '@' in email  # Too simplistic
```

### 2. Secret Management

```python
# Good
import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file

API_KEY = os.getenv('API_KEY')
if not API_KEY:
    raise ValueError("API_KEY not set")

# Bad
API_KEY = "hardcoded-key-in-code"
```

### 3. SQL Injection Prevention

```python
# Good (using parameterized queries)
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))

# Bad (string concatenation)
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

## 🧪 Testing Patterns

### 1. Unit Test Structure

```python
import pytest
from my_module import my_function

class TestMyFunction:
    """Test suite for my_function."""
    
    @pytest.fixture
    def sample_data(self):
        """Sample data for testing."""
        return {"key": "value"}
    
    def test_success(self, sample_data):
        """Test successful execution."""
        result = my_function(sample_data)
        assert result == expected_output
    
    def test_error_handling(self):
        """Test error handling."""
        with pytest.raises(ValueError):
            my_function(invalid_data)
    
    def test_edge_cases(self):
        """Test edge cases."""
        # Test empty input
        assert my_function({}) == default_output
        
        # Test large input
        large_data = {"key": "x" * 10000}
        assert len(my_function(large_data)) == 10000
```

### 2. Mocking External Services

```python
from unittest.mock import patch, MagicMock

def test_api_call():
    """Test API call with mocking."""
    
    # Mock response
    mock_response = MagicMock()
    mock_response.json.return_value = {"status": "success"}
    mock_response.raise_for_status.return_value = None
    
    with patch('requests.get', return_value=mock_response):
        result = make_api_call()
        assert result == {"status": "success"}
```

## 📊 Performance Patterns

### 1. Caching

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_operation(param: str) -> Any:
    """Cache results of expensive operation."""
    # ... expensive computation ...
    return result
```

### 2. Batch Processing

```python
def process_batch(items: List[Any], batch_size: int = 100) -> None:
    """Process items in batches."""
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        process_batch_internal(batch)

def process_batch_internal(batch: List[Any]) -> None:
    """Process single batch."""
    # ... batch processing ...
```

## 🔧 Tool Recommendations

### Essential Tools

```bash
# Linting
pip install flake8 black isort

# Testing
pip install pytest pytest-cov

# Type checking
pip install mypy

# Formatting
pip install autopep8

# Security
pip install bandit safety
```

### Recommended Configuration

**pyproject.toml:**

```toml
[tool.black]
line-length = 100
target-version = ['py310']

[tool.isort]
profile = "black"
line_length = 100

[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
```

**Makefile:**

```makefile
.PHONY: lint test format check

lint:
	flake8 .
	black --check .
	isort --check .

test:
	pytest --cov=src --cov-report=term-missing

format:
	black .
	isort .

check:
	mypy .
	bandit -r .

all: lint test format check
```

## 📖 References

- [Python Official Documentation](https://docs.python.org/3/)
- [PEP 8 Style Guide](https://peps.python.org/pep-0008/)
- [Type Hints Cheat Sheet](https://mypy.readthedocs.io/en/stable/cheat_sheet_py3.html)
- [Pydantic Documentation](https://pydantic.dev/)

---

**Python Execution Patterns** — Best practices for Sonic Family projects 🐍
