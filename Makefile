.PHONY: help update build core thinui dev test lint clean doctor release story-deploy publish-ci yarnspinner-build yarnspinner-process yarnspinner-daemon yarnspinner-stop stop

help:
	@echo "Available targets:"
	@echo "  update        - git pull --recurse-submodules"
	@echo "  build         - build uCode1 and ThinUI (legacy Rust)"
	@echo "  core          - run uCode1 daemon (--status)"
	@echo "  thinui        - run ThinUI"
	@echo "  dev           - start all services (core + thinui)"
	@echo "  test          - run all Python tests"
	@echo "  lint          - run Python linter (ruff)"
	@echo "  clean         - remove build artifacts"
	@echo "  doctor        - run system health check"
	@echo "  release       - bump version and tag"
	@echo "  story-deploy  - deploy public story site to GitHub Pages"
	@echo "  publish-ci    - simulate CI publish workflow locally"
	@echo "  yarnspinner-build    - build yarnspinner"
	@echo "  yarnspinner-process  - run yarnspinner once to process events"
	@echo "  yarnspinner-daemon   - run yarnspinner as daemon"
	@echo "  yarnspinner-stop     - stop yarnspinner daemon"

update:
	git pull --recurse-submodules
	git submodule update --remote --recursive

build:
	cd uCode1 && cargo build --release
	cd ThinUI && cargo tauri build
	cd SonicExpress/yarnspinner && cargo build --release

core:
	cd uCode1 && cargo run -- --status

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

thinui:
	cd ThinUI && npm run dev

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

clean:
	@echo "🧹 Cleaning uCode1 universe..."
	rm -rf .compost .state Vendor/.legacy
	find . -name "target" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	find . -name "node_modules" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	rm -f ThinUI/.port ThinUI/.pid 2>/dev/null || true
	@echo "✅ Cleanup complete"

# =============================================================================
# PYTHON (uCode1) TARGETS
# =============================================================================

test: ## Run all Python tests
	@echo "Running Python tests..."
	cd uCode1 && python3 -m pytest tests/ -v --tb=short
	@echo "✅ All tests passed"

lint: ## Lint Python code with ruff
	@echo "Linting Python code..."
	cd uCode1 && python3 -m ruff check --ignore E501,F401 core_py/ narrator/ tests/ --no-cache || true
	@echo "✅ Lint complete"

publish-ci: ## Simulate CI publish locally
	@echo "Building Python wheel..."
	cd uCode1 && python3 -m build --wheel
	@echo "Wheel: dist/*.whl"
	@echo "✅ Build complete. Run 'twine upload dist/*' to publish."

release: ## Create a new release tag (usage: make release VERSION=0.2.0)
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

doctor:
	cd uCode1 && python3 ucode --help | head -3

story-deploy:
	cd story && bash scripts/story-deploy.sh

stop:
	@echo "🛑 Stopping all uCode1 services..."
	pkill -f "cargo run -- dev" 2>/dev/null || true
	pkill -f "npm run dev" 2>/dev/null || true
	pkill -f "yarnspinner daemon" 2>/dev/null || true
	rm -f ThinUI/.port ThinUI/.pid 2>/dev/null || true
	cd SonicExpress/yarnspinner && ./target/release/yarnspinner stop 2>/dev/null || true
	@echo "✅ All services stopped"

yarnspinner-build:
	cd SonicExpress/yarnspinner && cargo build --release

yarnspinner-process:
	cd SonicExpress/yarnspinner && ./target/release/yarnspinner process

yarnspinner-daemon:
	cd SonicExpress/yarnspinner && ./target/release/yarnspinner daemon &

yarnspinner-stop:
	cd SonicExpress/yarnspinner && ./target/release/yarnspinner stop