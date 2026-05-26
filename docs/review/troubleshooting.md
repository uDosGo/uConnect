# uDos Troubleshooting Guide

Common issues and their solutions.

---

## CLI Issues

### `ucode: command not found`
```bash
cd ~/Code/uDosGo/uCode1
python3 ucode --help
```
Always run `ucode` from the `uCode1/` directory, or use the full path.

### `unknown command 'X'`
Run `python3 ucode --help` to see available commands. The current commands are:
`ok`, `narrator`, `lexicon`, `character`, `cell`, `feed`, `snack`, `binder`,
`relic`, `usxd`, `grid`, `thinui`, `mdx`, `vault`, `plugin`

### Import errors when running CLI
```bash
cd ~/Code/uDosGo/uCode1
source ../.venv/bin/activate  # Use the project virtual environment
python3 ucode snack list
```

## Test Issues

### `ModuleNotFoundError: No module named 'core_py'`
Run tests from the `uCode1/` directory:
```bash
cd ~/Code/uDosGo/uCode1
python3 -m pytest tests/ -v
```

### `pytest: command not found`
```bash
source ~/Code/uDosGo/.venv/bin/activate
pip install pytest
```

### Tests failing with shared state issues
Tests use `tempfile.mkdtemp()` for isolation. If you see cross-test contamination,
check that `setup_method` creates fresh instances and stores use temp directories.

### `129 tests, 0 failed` is the expected state
Run `python3 -m pytest tests/ -v --tb=short` to verify.

## ThinUI Issues

### ThinUI API won't start
```bash
source ~/Code/uDosGo/.venv/bin/activate
pip install flask
cd ~/Code/uDosGo/uCode1
python3 thinui_cli.py api --port 8001
```

### Grid Viewer shows "API: offline"
The ThinUI React surface needs the Python API server running:
```bash
# In one terminal:
cd ~/Code/uDosGo/uCode1
source ../.venv/bin/activate
python3 thinui_cli.py api --port 8001

# In another terminal (or ThinUI browser):
curl http://127.0.0.1:8001/api/thinui/health
```

### Grid parse returns 500 error
Check the API server terminal for the Python traceback. Common causes:
- Invalid/malformed ASCII grid text
- Missing `title` parameter
- Very large grids causing timeout

## Monodraw Issues

### `monodraw: command not found`
```bash
# Install the symlink
sudo ln -sf /Applications/Monodraw.app/Contents/Resources/monodraw /usr/local/bin/monodraw

# Verify
monodraw --version
```

### `Could not read file at path`
The `monodraw` CLI only reads native `.monopic` files (binary format).
For plain text files, open with:
```bash
open -a Monodraw mygrid.txt
```
Then save as `.monopic` from Monodraw's GUI.

### Monodraw round-trip workflow
```
1. ucode grid monodraw export mygrid.txt
2. open -a Monodraw mygrid_monodraw.txt
3. Edit visually, then File > Save As... → save as .monopic
4. ucode grid monodraw import mygrid.monopic
```

## Cell Storage Issues

### `ucode cell list` shows no cells
- Cells are stored in `.state/cells/` relative to the current directory
- Run from `uCode1/`: `cd ~/Code/uDosGo/uCode1`
- Check: `find .state/cells -name "*.cell.json"`

### Invalid address format
```bash
# Correct format:
ucode cell write L100-AA00-0000-0 --key name --value test

# Format: L<band>-<col><row><sub>-<layer><slot>-<version>
# band:    100-899
# col:     A-Z
# row:     A-Z
# sub:     00-99
# layer:   0-9
# slot:    000-127
# version: 0-9
```

### Cell integrity check fails
The cell data was modified outside the CellStore. Delete and recreate:
```bash
ucode cell delete L100-AA00-0000-0
ucode cell write L100-AA00-0000-0 --data '{"correct":"data"}'
```

## MDX Issues

### Snack not found
When using `<Snack id="greet">` in MDX, the snack must be registered:
```bash
# Provide a directory with .snack files
ucode mdx process doc.mdx --snack-dir ./snacks/
```

Snack files should be valid JSON with the required `id`, `name`,
`version`, `runtime`, and `code` fields.

### Invalid inputs JSON
Shortcode inputs must be valid JSON:
```mdx
<!-- Correct -->
<Snack id="greet" inputs='{"NAME":"uDos"}'>

<!-- Wrong -->
<Snack id="greet" inputs="{NAME: 'uDos'}">
```

## Feed Archiving Issues

### Feed file not found
```bash
ucode feed archive /path/to/events.jsonl
```
Feed files should be JSONL format (one JSON object per line).

### No feed cells found
```bash
ucode feed list
ucode feed report
```
Feed cells are stored in band L300. Verify with:
```bash
ucode cell list --band 300
```

## Vault Issues

### Vault path not found
The vault location defaults to `~/Code/Vault/`. Override with:
```bash
export VAULT_PATH=/custom/vault/path
```

### Permission denied
Ensure `~/Code/Vault/` exists:
```bash
mkdir -p ~/Code/Vault
```

## Environment Issues

### Python version mismatch
uCode1 requires Python 3.9+. Check version:
```bash
python3 --version
```

### Virtual environment not activated
```bash
source ~/Code/uDosGo/.venv/bin/activate
which python3  # Should show path inside .venv/
```

### Flask not installed
```bash
pip install flask
```

### Missing dependencies
```bash
pip install -r ~/Code/uDosGo/uCode1/requirements.txt
```

## Build Issues

### `make test` fails
```bash
# Run tests directly
cd ~/Code/uDosGo/uCode1
source ../.venv/bin/activate
python3 -m pytest tests/ -v
```

### `make lint` reports many warnings
Lint warnings are non-blocking. The CI uses `continue-on-error` for linting.
To fix a specific warning, use:
```bash
cd ~/Code/uDosGo/uCode1
python3 -m ruff check --fix core_py/ narrator/ tests/
```

### CI pipeline fails
Check the GitHub Actions logs at:
`https://github.com/uDosGo/Connect/actions`

Common CI failures:
- Python test failure: run locally to reproduce
- Rust build failure: `cd uCode2 && cargo build`
- ThinUI build failure: `cd uCode2/ThinUI && npm ci && npm run build`

## Getting Help

- **GitHub Issues**: https://github.com/uDosGo/Connect/issues
- **Roadmap**: See `docs/roadmap.md`
- **API Reference**: See `docs/api-reference.md`
- **User Guide**: See `docs/user-guide.md`
- **Developer Guide**: See `docs/dev-guide.md`
