#!/bin/bash
# uDos Publishing Lane Scheduler
# Runs on Ubuntu via systemd timer (every 5 minutes)
# Processes publishing lane tasks and triggers releases

set -euo pipefail

VAULT_DIR="${HOME}/Vault"
BINDER="${HOME}/Code/DevStudio/bin/ucode2-binder"
FEEDS_DIR="${HOME}/uDos/shared/feeds"
MCP_ENDPOINT="http://localhost:30001"
LOG_FILE="${HOME}/.local/state/udos/logs/publish-cycle.log"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=== Publishing Cycle Start ==="

# Step 1: Process publishing lane tasks
log "Processing publishing lane tasks..."
cd "$VAULT_DIR"

# Check for tasks in review status in publishing lane
REVIEW_TASKS=$(python3 -c "
import sys, json
sys.path.insert(0, '${HOME}/Code/DevStudio')
from Usync.binder.task_models import scan_tasks, update_task, write_feeds
tasks = scan_tasks(lane='publishing', status='review')
for t in tasks:
    print(t.task_id)
")

if [ -n "$REVIEW_TASKS" ]; then
    log "Found publishing tasks in review:"
    echo "$REVIEW_TASKS" | while read -r task_id; do
        log "  Processing task: $task_id"
        # Run checks via cn (Continue CLI)
        if command -v cn &>/dev/null; then
            log "  Running cn checks for $task_id..."
            cn -p "Review publishing queue and trigger pending releases" --auto 2>&1 | tee -a "$LOG_FILE" || true
        fi
        # Mark as done
        python3 -c "
import sys
sys.path.insert(0, '${HOME}/Code/DevStudio')
from Usync.binder.task_models import update_task, write_feeds
task = update_task('$task_id', 'status', 'done')
if task:
    print(f'  ✅ Task $task_id marked as done')
else:
    print(f'  ❌ Failed to update task $task_id')
write_feeds()
" 2>&1 | tee -a "$LOG_FILE"
    done
else:
    log "No publishing tasks in review"

# Step 2: Check for done dev tasks that need publishing
log "Checking for done dev tasks..."
DONE_DEV_TASKS=$(python3 -c "
import sys
sys.path.insert(0, '${HOME}/Code/DevStudio')
from Usync.binder.task_models import scan_tasks, create_task
tasks = scan_tasks(lane='dev', status='done')
for t in tasks:
    print(f\"{t.task_id}|{t.frontmatter.title}|{t.frontmatter.workflow or ''}\")
")

if [ -n "$DONE_DEV_TASKS" ]; then
    echo "$DONE_DEV_TASKS" | while IFS='|' read -r task_id title workflow; do
        log "  Done dev task: $title ($task_id)"
        # Create a publishing task for this
        python3 -c "
import sys
sys.path.insert(0, '${HOME}/Code/DevStudio')
from Usync.binder.task_models import create_task, write_feeds
pub_task = create_task(
    title='Publish: $title',
    lane='publishing',
    description='Auto-created from completed dev task: $task_id',
    priority='medium',
    tags=['auto', 'publish']
)
print(f'  📦 Created publishing task: {pub_task.task_id}')
write_feeds()
" 2>&1 | tee -a "$LOG_FILE"

        # Trigger GitHub Actions workflow if specified
        if [ -n "$workflow" ]; then
            log "  Triggering workflow: $workflow"
            gh workflow run "$workflow" --ref main 2>&1 | tee -a "$LOG_FILE" || true
        fi
    done
else
    log "No done dev tasks to publish"
fi

# Step 3: Notify MCP endpoint
log "Notifying MCP feed endpoint..."
curl -s -X POST "${MCP_ENDPOINT}/api/mcp/feed-update" \
    -H "Content-Type: application/json" \
    -d '{"lane":"publishing"}' 2>&1 | tee -a "$LOG_FILE" || true

# Step 4: Regenerate feeds
log "Regenerating all feeds..."
python3 -c "
import sys
sys.path.insert(0, '${HOME}/Code/DevStudio')
from Usync.binder.task_models import write_feeds
write_feeds()
print('Feeds regenerated')
" 2>&1 | tee -a "$LOG_FILE"

log "=== Publishing Cycle Complete ==="
