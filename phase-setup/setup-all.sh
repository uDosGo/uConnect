#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Master Phase Setup Orchestrator
# Runs all phase setup scripts in sequence
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           uDosGo — Master Phase Setup Orchestrator            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

PHASES=(
  "phase1:Foundation & Core Infrastructure"
  "phase2:Snack & Relic System"
  "phase3:Binder & MDX Runtime"
  "phase4:USXD/OBF & ASCII Grid Parser"
  "phase5:Testing & Documentation"
  "phase6:Deployment & Release"
  "phase7:uCode3 Rust & uCode4 3D/Voxel"
  "phase8:AI & Metaverse"
  "phase9:WordPress Integration & Feed System"
  "phase10:Ecosystem & Community"
)

for phase_entry in "${PHASES[@]}"; do
  phase_dir="${phase_entry%%:*}"
  phase_desc="${phase_entry#*:}"
  setup_script="$SCRIPT_DIR/$phase_dir/setup.sh"

  echo ""
  echo "───────────────────────────────────────────────────────────────"
  echo "  Running: $phase_dir — $phase_desc"
  echo "───────────────────────────────────────────────────────────────"

  if [ -f "$setup_script" ]; then
    bash "$setup_script"
  else
    echo "  ⚠️  Setup script not found: $setup_script"
  fi
done

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           All Phase Setup Scripts Complete                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Quick Status Summary:"
echo "  ✅ Complete:     Phases 2 (all), 5 (docs)"
echo "  🔄 In Progress:  Phase 1 (bench, condense, devmode)"
echo "  ❌ Not Started:  Phases 3 (Story Format), 4 (Architecture Evolution)"
echo "                    Phase 6 (releases), Phases 7-10 (future)"
echo ""
echo "Next Steps:"
echo "  1. Complete Phase 1 remaining items"
echo "  2. Implement Phase 3 Story Format"
echo "  3. Document Phase 4 Architecture Evolution"
echo "  4. Plan Phase 6 releases"
echo "  5. Scope Phases 7-10"
