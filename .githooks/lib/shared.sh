#!/bin/bash
# =============================================================================
# uDosGo Pre-Commit Hook - Shared Library
# =============================================================================
# Provides helper functions used by the pre-commit hook and individual checks.
# =============================================================================

# ── Color output ────────────────────────────────────────────────────────────
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    CYAN=''
    BOLD=''
    NC=''
fi

# ── Logging helpers ─────────────────────────────────────────────────────────
log_info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_ok()      { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; }
log_step()    { echo -e "\n${CYAN}── $* ──${NC}"; }

# ── Check runner ────────────────────────────────────────────────────────────
# Usage: run_check "Check Name" "/path/to/check/script.sh"
# Returns 0 on success, 1 on failure.
run_check() {
    local name="$1"
    local script="$2"
    shift 2

    echo -n "  ${BOLD}${name}...${NC} "

    if [ ! -f "$script" ]; then
        echo -e "${YELLOW}⚠ SKIPPED (script not found)${NC}"
        return 0
    fi

    if [ ! -x "$script" ]; then
        echo -e "${YELLOW}⚠ SKIPPED (script not executable)${NC}"
        return 0
    fi

    # Run the check script, capturing output
    local output
    if output=$("$script" "$@" 2>&1); then
        echo -e "${GREEN}✅ PASSED${NC}"
        return 0
    else
        local exit_code=$?
        echo -e "${RED}❌ FAILED (exit code: $exit_code)${NC}"
        if [ -n "$output" ]; then
            echo ""
            # Indent output for readability
            echo "$output" | sed 's/^/      /'
            echo ""
        fi
        return 1
    fi
}

# ── Skip check support ──────────────────────────────────────────────────────
# Usage: if should_run "check_name"; then ...
# Respects SKIP environment variable: SKIP=ruff,rust
should_run() {
    local check_name="$1"
    if [ -n "${SKIP:-}" ]; then
        IFS=',' read -ra SKIP_LIST <<< "$SKIP"
        for skip_item in "${SKIP_LIST[@]}"; do
            skip_item="$(echo "$skip_item" | xargs)"  # trim
            if [ "$skip_item" = "$check_name" ]; then
                echo -e "  ${YELLOW}⚠ SKIPPED ($check_name via SKIP env)${NC}"
                return 1
            fi
        done
    fi
    return 0
}

# ── Tool availability check ─────────────────────────────────────────────────
# Usage: require_tool "ruff" "pip install ruff"
require_tool() {
    local tool="$1"
    local install_hint="${2:-}"
    if ! command -v "$tool" &>/dev/null; then
        log_error "'$tool' is required but not installed."
        if [ -n "$install_hint" ]; then
            log_info "Install: $install_hint"
        fi
        return 1
    fi
    return 0
}

# ── Staged files helpers ────────────────────────────────────────────────────
# Get list of staged files matching a pattern
staged_files() {
    local pattern="${1:-}"
    if [ -n "$pattern" ]; then
        git diff --cached --name-only --diff-filter=ACMR | grep -E "$pattern" || true
    else
        git diff --cached --name-only --diff-filter=ACMR || true
    fi
}

# Get count of staged files matching a pattern
staged_count() {
    local pattern="$1"
    staged_files "$pattern" | wc -l | tr -d ' '
}

# ── Timing helper ───────────────────────────────────────────────────────────
timer_start() {
    _timer_start=$(date +%s%N)
}

timer_end() {
    if [ -n "${_timer_start:-}" ]; then
        local end
        end=$(date +%s%N)
        local elapsed=$(( (end - _timer_start) / 1000000 ))
        echo "${elapsed}ms"
    fi
}
