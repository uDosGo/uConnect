#!/bin/bash

# DevStudio Workflow Script
# Manage agentic workflows

source "$(dirname "$0")/utils.sh"

# Show workflow help
workflow_help() {
    echo "DevStudio Workflow Management"
    echo ""
    echo "Usage: devstudio workflow <command> [options]"
    echo ""
    echo "Commands:"
    echo "  create <name>    Create a new workflow from natural language"
    echo "  list             List all workflows"
    echo "  show <name>      Show workflow details"
    echo "  run <name>       Execute a workflow"
    echo "  delete <name>    Delete a workflow"
    echo "  help             Show this help"
}

# Create a new workflow
workflow_create() {
    local name="$1"
    
    if [ -z "$name" ]; then
        echo "Error: Workflow name required"
        workflow_help
        exit 1
    fi
    
    log "info" "Creating workflow: $name"
    
    # Ask for description
    echo "Enter a natural language description of the workflow:"
    echo "(Example: 'Every Monday at 9am, pull feeds, generate summary, and deploy to GitHub Pages')"
    echo "Press Ctrl+D when finished."
    
    local description=$(cat)
    
    if [ -z "$description" ]; then
        log "error" "No description provided"
        exit 1
    fi
    
    # Compile workflow using Re3Engine
    log "info" "Compiling workflow description..."
    local workflow_json=$(compile_workflow "$description")
    
    if [ -z "$workflow_json" ]; then
        log "error" "Failed to compile workflow"
        exit 1
    fi
    
    # Create workflow file
    local workflow_file="$WORKFLOW_DIR/${name}.udx"
    
    # Create UDX workflow structure
    local udx_content=$(cat <<EOF
{
  "version": "1.0",
  "type": "agentic_workflow",
  "name": "$name",
  "description": "$(echo "$description" | jq -R .)",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "updated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "steps": $workflow_json,
  "metadata": {
    "source": "devstudio",
    "compiler": "re3engine",
    "llm_provider": "$LLM_PROVIDER"
  }
}
EOF
    )
    
    echo "$udx_content" > "$workflow_file"
    
    log "info" "Workflow created: $workflow_file"
    echo "✅ Workflow '$name' created successfully"
    echo "Run it with: devstudio workflow run $name"
}

# List all workflows
workflow_list() {
    log "info" "Listing workflows..."
    
    if [ ! -d "$WORKFLOW_DIR" ] || [ -z "$(ls -A "$WORKFLOW_DIR")" ]; then
        echo "No workflows found. Create one with: devstudio workflow create <name>"
        return
    fi
    
    echo "Available Workflows:"
    echo "--------------------"
    
    for file in "$WORKFLOW_DIR"/*.udx; do
        local name=$(basename "$file" .udx)
        local description=$(jq -r '.description' "$file" 2>/dev/null || echo "No description")
        local steps_count=$(jq '.steps | length' "$file" 2>/dev/null || echo "0")
        local created_at=$(jq -r '.created_at' "$file" 2>/dev/null || echo "Unknown")
        
        echo "📋 $name"
        echo "   Description: $description"
        echo "   Steps: $steps_count"
        echo "   Created: $created_at"
        echo ""
    done
}

# Show workflow details
workflow_show() {
    local name="$1"
    
    if [ -z "$name" ]; then
        echo "Error: Workflow name required"
        workflow_help
        exit 1
    fi
    
    local workflow_file="$WORKFLOW_DIR/${name}.udx"
    
    if [ ! -f "$workflow_file" ]; then
        log "error" "Workflow not found: $name"
        exit 1
    fi
    
    log "info" "Showing workflow: $name"
    
    # Pretty print the workflow
    jq . "$workflow_file"
}

# Run a workflow
workflow_run() {
    local name="$1"
    
    if [ -z "$name" ]; then
        echo "Error: Workflow name required"
        workflow_help
        exit 1
    fi
    
    local workflow_file="$WORKFLOW_DIR/${name}.udx"
    
    if [ ! -f "$workflow_file" ]; then
        log "error" "Workflow not found: $name"
        exit 1
    fi
    
    log "info" "Starting workflow: $name"
    
    # Record workflow start in feed spool
    local start_reply=$(cat <<EOF
{
  "reply_id": "workflow-${name}-$(date +%s)",
  "thread_id": "workflow-$name",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "source": "devstudio",
  "user_id": "system",
  "compartment": "workflows",
  "prompt": "Starting workflow: $name",
  "output": "Workflow execution started",
  "tags": ["workflow", "start"],
  "metadata": {
    "workflow_name": "$name",
    "status": "started"
  }
}
EOF
    )
    
    mcp_call "reply_create" "$start_reply"
    
    # Execute each step
    local steps=$(jq -c '.steps[]' "$workflow_file")
    local step_count=1
    local success=true
    
    while IFS= read -r step; do
        local step_name=$(echo "$step" | jq -r '.name')
        local action=$(echo "$step" | jq -r '.action')
        local params=$(echo "$step" | jq -c '.parameters')
        
        log "info" "Step $step_count: $step_name ($action)"
        
        # Execute the action
        case "$action" in
            "vault_read")
                local file=$(echo "$params" | jq -r '.file')
                file="${file/#~/$HOME}"
                if [ -f "$file" ]; then
                    log "info" "Reading file: $file"
                    cat "$file"
                else
                    log "error" "File not found: $file"
                    success=false
                fi
                ;;
            "vault_write")
                local file=$(echo "$params" | jq -r '.file')
                local content=$(echo "$params" | jq -r '.content')
                file="${file/#~/$HOME}"
                log "info" "Writing to file: $file"
                mkdir -p "$(dirname "$file")"
                echo "$content" > "$file"
                ;;
            "shell_command")
                local command=$(echo "$params" | jq -r '.command')
                local workdir=$(echo "$params" | jq -r '.workdir // "."')
                workdir="${workdir/#~/$HOME}"
                log "info" "Executing command: $command"
                run_sandbox_command "$command" "$workdir"
                ;;
            "github_api")
                log "info" "GitHub API call (not implemented in MVP)"
                ;;
            "re3engine_call")
                local prompt=$(echo "$params" | jq -r '.prompt')
                local system=$(echo "$params" | jq -r '.system // ""')
                log "info" "Calling Re3Engine: $prompt"
                re3engine_chat "$prompt" "$system"
                ;;
            *)
                log "error" "Unknown action: $action"
                success=false
                ;;
        esac
        
        step_count=$((step_count + 1))
        echo ""
    done <<< "$steps"
    
    # Record workflow completion
    local status="completed"
    if [ "$success" = false ]; then
        status="failed"
    fi
    
    local end_reply=$(cat <<EOF
{
  "reply_id": "workflow-${name}-$(date +%s)",
  "thread_id": "workflow-$name",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "source": "devstudio",
  "user_id": "system",
  "compartment": "workflows",
  "prompt": "Completed workflow: $name",
  "output": "Workflow execution $status",
  "tags": ["workflow", "$status"],
  "metadata": {
    "workflow_name": "$name",
    "status": "$status",
    "steps_executed": $((step_count - 1))
  }
}
EOF
    )
    
    mcp_call "reply_create" "$end_reply"
    
    if [ "$success" = true ]; then
        log "info" "Workflow completed successfully: $name"
        echo "✅ Workflow '$name' completed successfully"
    else
        log "error" "Workflow failed: $name"
        echo "❌ Workflow '$name' failed"
        exit 1
    fi
}

# Delete a workflow
workflow_delete() {
    local name="$1"
    
    if [ -z "$name" ]; then
        echo "Error: Workflow name required"
        workflow_help
        exit 1
    fi
    
    local workflow_file="$WORKFLOW_DIR/${name}.udx"
    
    if [ ! -f "$workflow_file" ]; then
        log "error" "Workflow not found: $name"
        exit 1
    fi
    
    log "info" "Deleting workflow: $name"
    rm "$workflow_file"
    echo "✅ Workflow '$name' deleted"
}

# Main command routing
case "$1" in
    create)
        shift
        workflow_create "$@"
        ;;
    list)
        workflow_list
        ;;
    show)
        shift
        workflow_show "$@"
        ;;
    run)
        shift
        workflow_run "$@"
        ;;
    delete)
        shift
        workflow_delete "$@"
        ;;
    help|--help|-h)
        workflow_help
        ;;
    *)
        if [ -z "$1" ]; then
            workflow_help
        else
            echo "Unknown workflow command: $1"
            workflow_help
            exit 1
        fi
        ;;
esac