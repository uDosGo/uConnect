# =============================================================================
# uDosGo Unified Makefile
# =============================================================================
# Merged from Makefile (legacy) + Makefile.dev (new architecture)
# Last updated: 2026-05-05

.PHONY: help update build core thinui dev test lint clean doctor release story-deploy publish-ci yarnspinner-build yarnspinner-process yarnspinner-daemon yarnspinner-stop stop hooks-install hooks-verify hooks-uninstall hooks-run build-ucode2 start-mcp check-ucode2 clean-ucode2 build-tui build-thinui start-thinui start-thinui-tauri test-py test-py-quick test-rust test-spatial test-tui test-mcp clean-py cli cli-help runDemo check config-check

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

# =============================================================================
# HELP
# =============================================================================
help:
	@echo "uDosGo Unified Makefile"
	@echo "========================"
	@echo ""
	@echo "$(BLUE)General Targets:$(NC)"
	@echo "  help              Show this help message"
	@echo "  update            git pull --recurse-submodules"
	@echo "  build             Build everything (uCode2 Rust + ThinUI)"
	@echo "  dev               Start all services (core + thinui)"
	@echo "  test              Run all tests (Python + Rust)"
	@echo "  check             Check everything (no build)"
	@echo "  clean             Clean all build artifacts"
	@echo "  doctor            Run system health check"
	@echo "  release           Bump version and tag (usage: make release VERSION=x.y.z)"
	@echo "  stop              Stop all uCode1 services"
	@echo ""
	@echo "$(BLUE)uCode1 (Python) Targets:$(NC)"
	@echo "  test-py           Run all Python tests"
	@echo "  test-py-quick     Run Python tests (skip slow)"
	@echo "  clean-py          Clean Python artifacts"
	@echo "  lint              Lint Python code with ruff"
	@echo "  cli               Run unified ucode CLI"
	@echo "  cli-help          Show ucode CLI help"
	@echo "  runDemo           Run MCP integration demo"
	@echo "  publish-ci        Simulate CI publish workflow locally"
	@echo ""
	@echo "$(BLUE)uCode2 (Rust) Targets:$(NC)"
	@echo "  build-ucode2      Build uCode2 workspace"
	@echo "  start-mcp         Start MCP server"
	@echo "  check-ucode2      Check uCode2 workspace (no build)"
	@echo "  clean-ucode2      Clean uCode2 artifacts"
	@echo "  build-tui         Build TUI binary"
	@echo "  build-thinui      Build ThinUI surface shell"
	@echo "  start-thinui      Start ThinUI dev server"
	@echo "  start-thinui-tauri Start ThinUI Tauri app"
	@echo "  test-rust         Run Rust component tests"
	@echo "  test-spatial      Run spatial ops tests"
	@echo "  test-tui          Run TUI tests"
	@echo "  test-mcp          Run MCP tests"
	@echo ""
	@echo "$(BLUE)Git Hooks Targets:$(NC)"
	@echo "  hooks-install     Install pre-commit hooks"
	@echo "  hooks-verify      Verify hook installation"
	@echo "  hooks-uninstall   Uninstall hooks"
	@echo "  hooks-run         Run pre-commit checks manually (dry-run)"
	@echo ""
	@echo "$(BLUE)Legacy / Special Targets:$(NC)"
	@echo "  core              Run uCode1 daemon (--status)"
	@echo "  thinui            Run ThinUI"
	@echo "  story-deploy      Deploy public story site to GitHub Pages"
	@echo "  yarnspinner-build Build yarnspinner"
	@echo "  yarnspinner-process Run yarnspinner once to process events"
	@echo "  yarnspinner-daemon Run yarnspinner as daemon"
	@echo "  yarnspinner-stop  Stop yarnspinner daemon"
	@echo "  config-check      Check uDosGo configuration"

# =============================================================================
# GENERAL TARGETS
# =============================================================================

update:
	git pull --recurse-submodules
	git submodule update --remote --recursive

build: build-ucode2 build-thinui
	@echo "$(GREEN)Build complete$(NC)"

dev:
	@echo "🚀 Starting uCode1 universe in DEV mode..."
	@echo "=========================================="
	# Kill any existing processes
	pkill -f "cargo run -- dev" 2>/dev/null || true
	pkill -f "npm run dev" 2>/dev/null || true
	pkill -f "yarnspinner daemon" 2>/dev/null || true
	# Clean up port files
	rm -f ThinUI/.port ThinUI/.pid 2>/dev/null || true
	# Start services in background
	cd uCode1 && cargo run -- dev &
	UDOS_DEV_PID=$$!;
	echo "✅ uCode1 daemon started (PID: $$UDOS_DEV_PID)";
	sleep 2;
	cd ThinUI && npm run dev &
	THINUI_PID=$$!;
	echo "✅ ThinUI started (PID: $$THINUI_PID)";
	echo "=========================================="
	echo "🎮 uCode1 Universe is running!"
	echo "📊 uCode1: http://localhost:3000"
	echo "🖥️  ThinUI: http://localhost:<dynamic-port>"
	echo "=========================================="
	echo "Press Ctrl+C to stop all services"
	wait

test: test-py build-ucode2
	@echo "$(BLUE)Running Rust tests...$(NC)"
	cd uCode2 && cargo test --workspace
	@echo "$(GREEN)All tests passed$(NC)"

check: check-ucode2 test-py-quick
	@echo "$(GREEN)Check complete$(NC)"

clean: clean-py clean-ucode2
	@echo "🧹 Cleaning uCode1 universe..."
	rm -rf .compost .state Vendor/.legacy
	find . -name "target" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	find . -name "node_modules" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	rm -f ThinUI/.port ThinUI/.pid 2>/dev/null || true
	@echo "$(GREEN)Cleanup complete$(NC)"

doctor:
	cd uCode1 && python3 ucode --help | head -3

release:
	@if [ -z "$(VERSION)" ]; then \
		echo "Usage: make release VERSION=0.2.0"; \
		exit 1; \
	fi
	@echo "Creating release v$(VERSION)..."
	cd uCode1 && sed -i '' "s/__version__ = \".*\"/__version__ = \"$(VERSION)\"/" core_py/__init__.py
	git add -A
	git commit -m "chore: bump version to $(VERSION)"
	git tag -a "v$(VERSION)" -m "uCode1 v$(VERSION)"
	git push origin "v$(VERSION)"
	@echo "✅ Release v$(VERSION) created and pushed. CI will build and publish."

stop:
	@echo "🛑 Stopping all uCode1 services..."
	pkill -f "cargo run -- dev" 2>/dev/null || true
	pkill -f "npm run dev" 2>/dev/null || true
	pkill -f "yarnspinner daemon" 2>/dev/null || true
	rm -f ThinUI/.port ThinUI/.pid 2>/dev/null || true
	cd SonicExpress/yarnspinner && ./target/release/yarnspinner stop 2>/dev/null || true
	@echo "✅ All services stopped"

# =============================================================================
# uCODE1 (PYTHON) TARGETS
# =============================================================================

test-py:
	@echo "$(BLUE)Running Python tests...$(NC)"
	cd uCode1 && python3 -m pytest tests/ test_*.py -v

test-py-quick:
	@echo "$(BLUE)Running Python tests (quick)...$(NC)"
	cd uCode1 && python3 -m pytest tests/ test_*.py -v --ignore=tests/test_usxd_pipeline.py

clean-py:
	@echo "$(YELLOW)Cleaning Python artifacts...$(NC)"
	cd uCode1 && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	cd uCode1 && rm -rf .pytest_cache 2>/dev/null || true
	@echo "$(GREEN)Cleaned Python artifacts$(NC)"

lint:
	@echo "Linting Python code..."
	cd uCode1 && python3 -m ruff check --ignore E501,F401 core_py/ narrator/ tests/ --no-cache || true
	@echo "✅ Lint complete"

cli:
	cd uCode1 && python3 ucode $(filter-out $@,$(MAKECMDGOALS))

cli-help:
	cd uCode1 && python3 ucode --help

runDemo:
	@echo "$(BLUE)Running MCP Integration Demo...$(NC)"
	cd uCode1 && python3 examples/mcp_integration.py

publish-ci:
	@echo "Building Python wheel..."
	cd uCode1 && python3 -m build --wheel
	@echo "Wheel: dist/*.whl"
	@echo "✅ Build complete. Run 'twine upload dist/*' to publish."

# =============================================================================
# uCODE2 (RUST) TARGETS
# =============================================================================

build-ucode2:
	@echo "$(BLUE)Building uCode2 workspace...$(NC)"
	cd uCode2 && cargo build --workspace
	@echo "$(GREEN)uCode2 build complete$(NC)"

start-mcp:
	@echo "$(BLUE)Starting uCode2 MCP server...$(NC)"
	@echo "Socket: ~/.local/share/udos/mcp/core.sock"
	@echo "Press Ctrl+C to stop"
	cd uCode2 && cargo run --package ucode2-mcp

check-ucode2:
	@echo "$(BLUE)Checking uCode2 workspace...$(NC)"
	cd uCode2 && cargo check --workspace
	@echo "$(GREEN)uCode2 check complete$(NC)"

clean-ucode2:
	@echo "$(YELLOW)Cleaning uCode2 artifacts...$(NC)"
	cd uCode2 && cargo clean
	@echo "$(GREEN)Cleaned uCode2 artifacts$(NC)"

build-tui:
	@echo "$(BLUE)Building uCode2 TUI...$(NC)"
	cd uCode2 && cargo build --package ucode2-tui
	@echo "$(GREEN)TUI build complete$(NC)"

build-thinui:
	@echo "$(BLUE)Building ThinUI surface shell...$(NC)"
	cd uCode2/ThinUI && npm install && npm run build
	@echo "$(GREEN)ThinUI build complete$(NC)"

start-thinui:
	@echo "$(BLUE)Starting ThinUI dev server on port 4687...$(NC)"
	cd uCode2/ThinUI && npm run dev

start-thinui-tauri:
	@echo "$(BLUE)Starting ThinUI Tauri app...$(NC)"
	cd uCode2/ThinUI && cargo tauri dev

test-rust: test-spatial test-tui test-mcp
	@echo "$(GREEN)Rust component tests complete$(NC)"

test-spatial:
	@echo "$(BLUE)Running spatial tests...$(NC)"
	cd uCode2 && cargo test --package ucode2-spatial
	@echo "$(GREEN)Spatial tests complete$(NC)"

test-tui:
	@echo "$(BLUE)Running TUI tests...$(NC)"
	cd uCode2 && cargo test --package ucode2-tui
	@echo "$(GREEN)TUI tests complete$(NC)"

test-mcp:
	@echo "$(BLUE)Running MCP tests...$(NC)"
	cd uCode2 && cargo test --package ucode2-mcp
	@echo "$(GREEN)MCP tests complete$(NC)"

# =============================================================================
# LEGACY / SPECIAL TARGETS
# =============================================================================

core:
	cd uCode1 && cargo run -- --status

thinui:
	cd ThinUI && npm run dev

config-check:
	@echo "🔍 Checking uDosGo configuration..."
	@if [ -f udos-config.yaml ]; then \
	    echo "✅ Configuration file found: udos-config.yaml"; \
	else \
	    echo "❌ Configuration file missing: udos-config.yaml"; \
	    exit 1; \
	fi
	@if [ -f .vibe/config.toml ]; then \
	    echo "✅ Vibe configuration found: .vibe/config.toml"; \
	else \
	    echo "⚠️  Vibe configuration missing: .vibe/config.toml"; \
	fi
	@echo "✅ Configuration check complete"

story-deploy:
	cd story && bash scripts/story-deploy.sh

yarnspinner-build:
	cd SonicExpress/yarnspinner && cargo build --release

yarnspinner-process:
	cd SonicExpress/yarnspinner && ./target/release/yarnspinner process

yarnspinner-daemon:
	cd SonicExpress/yarnspinner && ./target/release/yarnspinner daemon &

yarnspinner-stop:
	cd SonicExpress/yarnspinner && ./target/release/yarnspinner stop

# =============================================================================
# GIT HOOKS TARGETS
# =============================================================================

hooks-install:
	@echo "🔧 Installing uDosGo pre-commit hooks..."
	bash .githooks/setup.sh install

hooks-verify:
	@echo "🔍 Verifying hook installation..."
	bash .githooks/setup.sh --verify

hooks-uninstall:
	@echo "🗑️  Uninstalling uDosGo hooks..."
	bash .githooks/setup.sh --uninstall

hooks-run:
	@echo "🧪 Running pre-commit checks (dry-run)..."
	@echo ""
	bash .githooks/pre-commit
