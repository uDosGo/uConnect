#!/bin/bash

# uDosConnect Launcher
# Quick access to uDosConnect development environment

echo "🚀 uDosConnect Launcher v0.1.0-beta.1"
echo "======================================"
echo ""

# Change to uDosConnect directory
cd "$(dirname "$0")" || exit 1

echo "📁 Working directory: $(pwd)"
echo ""

# Show main menu
PS3="Select an option: "
options=(
    "Start Development Server"
    "Run Tests"
    "Build for Production"
    "Generate Documentation"
    "Run Linter"
    "Show Status"
    "Exit"
)

select opt in "${options[@]}"; do
    case $opt in
        "Start Development Server")
            echo "🔥 Starting development server..."
            npm run dev
            break
            ;;
        "Run Tests")
            echo "🧪 Running tests..."
            npm run test
            break
            ;;
        "Build for Production")
            echo "🏗️  Building for production..."
            npm run build
            break
            ;;
        "Generate Documentation")
            echo "📚 Generating documentation..."
            npm run docs:generate
            break
            ;;
        "Run Linter")
            echo "🔍 Running linter..."
            npm run lint:check
            break
            ;;
        "Show Status")
            echo "📊 Project Status:"
            echo "Version: 0.1.0-beta.1"
            echo "Node: $(node --version)"
            echo "npm: $(npm --version)"
            echo "Git: $(git --version)"
            echo ""
            echo "Recent commits:"
            git log --oneline -5
            break
            ;;
        "Exit")
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option: $REPLY"
            ;;
    esac
done