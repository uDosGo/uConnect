#!/bin/bash
# Sync all project docs to the central docs-hub

PROJECTS_DIR="$HOME/Code/Projects"
DOCS_HUB="$HOME/Code/DevStudio/docs-hub"

# Clear existing docs-hub (optional: only if you want a clean sync)
rm -rf "$DOCS_HUB"/* 2>/dev/null

# Loop through each project
for project_path in "$PROJECTS_DIR"/*; do
    if [ -d "$project_path" ]; then
        project_name=$(basename "$project_path")
        docs_source="$project_path/docs"

        # Skip if no docs folder
        if [ ! -d "$docs_source" ]; then
            echo "No docs folder in $project_name. Skipping..."
            continue
        fi

        # Create project folder in docs-hub
        docs_target="$DOCS_HUB/$project_name"
        mkdir -p "$docs_target"

        # Mirror docs
        rsync -a --delete "$docs_source/" "$docs_target/"
        echo "Synced docs for $project_name to $docs_target"
    fi
done

echo "Docs sync complete."
