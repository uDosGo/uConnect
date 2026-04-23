#!/usr/bin/env bash
# v4 brief: run tests in repos that expose standard scripts (extend as needed).
set -eu
CODE="${UDOS_CODE_ROOT:-$HOME/Code}"
run_npm_test() {
  local dir="$1"
  [[ -f "$dir/package.json" ]] || return 0
  if grep -q '"test"' "$dir/package.json" 2>/dev/null; then
    echo "==> npm test in $dir"
    (cd "$dir" && npm test)
  fi
}
run_npm_test "$CODE/UniversalSurfaceXD/browser-mockup"
run_npm_test "$CODE/Chatdown"
echo "==> done (add Swift/go checks manually for Syncdown-app / uDosGo)"
