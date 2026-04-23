#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

require_file() {
  if [ ! -f "$1" ]; then
    echo "missing required file: $1" >&2
    exit 1
  fi
}

require_markdown_in_dir() {
  if ! find "$1" -maxdepth 1 -type f -name '*.md' | grep -q .; then
    echo "missing markdown content in: $1" >&2
    exit 1
  fi
}

cd "$REPO_ROOT"

require_file "$REPO_ROOT/README.md"
require_file "$REPO_ROOT/CHANGELOG.md"
require_file "$REPO_ROOT/docs/architecture.md"
require_file "$REPO_ROOT/docs/boundary.md"
require_file "$REPO_ROOT/docs/getting-started.md"
require_file "$REPO_ROOT/docs/examples.md"
require_file "$REPO_ROOT/docs/activation.md"
require_file "$REPO_ROOT/docs/themes-and-display-modes.md"
require_file "$REPO_ROOT/docs/publishing-architecture.md"
require_file "$REPO_ROOT/docs/local-vs-github-docs-boundary.md"
require_file "$REPO_ROOT/docs/course-hooks-and-onboarding.md"
require_file "$REPO_ROOT/docs/image-ingestion-markdown-lane.md"
require_file "$REPO_ROOT/docs/release-policy.md"
require_file "$REPO_ROOT/scripts/verify-o2-image-ingestion-lane.sh"
require_file "$REPO_ROOT/scripts/README.md"
require_file "$REPO_ROOT/tests/README.md"
require_file "$REPO_ROOT/config/README.md"
require_file "$REPO_ROOT/examples/README.md"
require_file "$REPO_ROOT/examples/basic-docs-update.md"
require_file "$REPO_ROOT/site/index.html"
require_file "$REPO_ROOT/site/manifest.html"
require_file "$REPO_ROOT/site/learning.html"
require_file "$REPO_ROOT/site/reference.html"
require_file "$REPO_ROOT/site/runtime.html"
require_file "$REPO_ROOT/site/surface.html"
require_file "$REPO_ROOT/site/operations.html"
require_file "$REPO_ROOT/site/app.js"
require_file "$REPO_ROOT/site/styles.css"
require_file "$REPO_ROOT/site/data/family-source.json"
require_file "$REPO_ROOT/site/data/family.json"
require_file "$REPO_ROOT/site/data/library-manifest.json"
require_file "$REPO_ROOT/scripts/generate-site-data.mjs"

require_markdown_in_dir "$REPO_ROOT/architecture"
require_markdown_in_dir "$REPO_ROOT/wizard"
require_markdown_in_dir "$REPO_ROOT/alpine"
require_markdown_in_dir "$REPO_ROOT/uhome"

node "$REPO_ROOT/scripts/generate-site-data.mjs" --check >/dev/null
bash "$REPO_ROOT/scripts/verify-o2-image-ingestion-lane.sh" >/dev/null

if command -v rg >/dev/null 2>&1; then
  if rg -n '/Users/fredbook/Code|~/Users/fredbook/Code' \
    "$REPO_ROOT/README.md" \
    "$REPO_ROOT/docs" \
    "$REPO_ROOT/site" \
    "$REPO_ROOT/tests" \
    "$REPO_ROOT/examples" \
    "$REPO_ROOT/config"; then
    echo "private local-root reference found in uDOS-docs" >&2
    exit 1
  fi
else
  if grep -R -nE '/Users/fredbook/Code|~/Users/fredbook/Code' \
    "$REPO_ROOT/README.md" \
    "$REPO_ROOT/docs" \
    "$REPO_ROOT/site" \
    "$REPO_ROOT/tests" \
    "$REPO_ROOT/examples" \
    "$REPO_ROOT/config" >/dev/null 2>&1; then
    echo "private local-root reference found in uDOS-docs" >&2
    exit 1
  fi
fi

echo "uDOS-docs checks passed"
