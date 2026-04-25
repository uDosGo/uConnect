.PHONY: help update build core thinui dev clean doctor

help:
	@echo "Available targets:"
	@echo "  update    - git pull --recurse-submodules"
	@echo "  build     - build uCode1 and ThinUI"
	@echo "  core      - run uCode1 daemon (--status)"
	@echo "  thinui    - run ThinUI"
	@echo "  dev       - start all services (core + thinui + re3chat)"
	@echo "  clean     - remove .compost, .state, .legacy and target/ folders"
	@echo "  doctor    - run udos doctor"

update:
	git pull --recurse-submodules
	git submodule update --remote --recursive

build:
	cd uCode1 && cargo build --release
	cd ThinUI && cargo tauri build

core:
	cd uCode1 && cargo run -- --status

thinui:
	cd ThinUI && cargo tauri dev

dev:
	@echo "Starting all services..."
	cd uCode1 && cargo run -- dev

clean:
	rm -rf .compost .state Vendor/.legacy
	find . -name "target" -type d -prune -exec rm -rf {} \;
	find . -name "node_modules" -type d -prune -exec rm -rf {} \;

doctor:
	cd uCode1/udos-cli && cargo run -- doctor
