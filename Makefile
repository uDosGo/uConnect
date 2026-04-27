.PHONY: help update build core thinui dev clean doctor story-deploy yarnspinner-build yarnspinner-process yarnspinner-daemon yarnspinner-stop stop

help:
	@echo "Available targets:"
	@echo "  update        - git pull --recurse-submodules"
	@echo "  build         - build uCode1 and ThinUI"
	@echo "  core          - run uCode1 daemon (--status)"
	@echo "  thinui        - run ThinUI"
	@echo "  dev           - start all services (core + thinui)"
	@echo "  stop          - stop all running services"
	@echo "  clean         - remove .compost, .state, .legacy and target/ folders"
	@echo "  doctor        - run udos doctor"
	@echo "  story-deploy  - deploy public story site to GitHub Pages"
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

doctor:
	cd uCode1 && ./target/release/uCode1 --status

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