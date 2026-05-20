#!/bin/bash
# Publish docs from docs-hub to GitHub Pages

DOCS_HUB="$HOME/Code/DevStudio/docs-hub"
PUBLISH_BRANCH="gh-pages"
REPO_URL="git@github.com:OkAgentDigital/docs-repo.git"
METADATA_FILE="$DOCS_HUB/_index/metadata.json"

# Check if metadata exists
if [ ! -f "$METADATA_FILE" ]; then
    echo "Error: Metadata file not found at $METADATA_FILE"
    exit 1
fi

# Initialize temp repo
TMP_DIR=$(mktemp -d)
git -C "$TMP_DIR" init
git -C "$TMP_DIR" config user.name "Doc Publisher"
git -C "$TMP_DIR" config user.email "doc-publisher@example.com"

# Copy only docs marked for publishing
while read -r project; do
    if jq -e ".[] | select(.project == \"$project\" and .publish == true)" "$METADATA_FILE" >/dev/null; then
        cp -r "$DOCS_HUB/$project" "$TMP_DIR/"
        echo "Added $project to publish queue."
    fi
done < <(ls "$DOCS_HUB")

# Commit and push
cd "$TMP_DIR" || exit 1
git add .
git commit -m "Publish docs $(date +%Y-%m-%d)"
git push -f "$REPO_URL" HEAD:"$PUBLISH_BRANCH"

# Cleanup
rm -rf "$TMP_DIR"
echo "Docs published to $PUBLISH_BRANCH."
