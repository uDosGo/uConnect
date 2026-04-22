#!/bin/bash

# uDosConnect React Renderer Demo Script
# This script demonstrates the features of the React Renderer v2.0

echo "🎬 uDosConnect React Renderer Demo"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "tools/gui-api" ]; then
    echo "❌ Please run this script from the uDosConnect root directory"
    exit 1
fi

# Function to print section headers
title() {
    echo ""
    echo "📋 $1"
    echo "-----------------------------------"
}

# Function to print steps
step() {
    echo "  $1"
}

# Function to print commands
command() {
    echo "  💻 $1"
}

# Function to print info
info() {
    echo "  ℹ️ $1"
}

# Introduction
title "Welcome to the React Renderer Demo"
echo "This demo will showcase the enhanced React Renderer v2.0"
echo "with real data integration and professional UI features."
echo ""

# Step 1: Start API Server
title "Step 1: Starting GUI API Server"
step "The React Renderer needs the GUI API server for real data."
command "cd tools/gui-api && pnpm start"
info "This will start the server on http://localhost:5175"
info "Press Ctrl+C when you're ready to continue..."
echo ""

# Wait for user to start server
read -p "Press Enter after starting the API server..." -r

# Step 2: Build UI
title "Step 2: Building the UI"
step "Let's build the UI with the React Renderer."
command "cd ui && pnpm build"
info "This creates the production-ready build."
echo ""

# Step 3: Start UI Server
title "Step 3: Starting UI Server"
step "Now we'll start the UI server to see the React Renderer."
command "cd ui && pnpm preview"
info "The UI will be available at http://localhost:4173"
info "Press Ctrl+C when you're ready to continue..."
echo ""

# Wait for user to start UI server
read -p "Press Enter after starting the UI server..." -r

# Step 4: Demo Features
title "Step 4: React Renderer Features Demo"
echo "Open your browser to http://localhost:4173/surface/react-renderer"
echo ""

step "🎯 Feature 1: Surface Navigation"
info "Click on different surfaces in the sidebar to switch between them."
info "Notice the breadcrumb navigation at the top."
echo ""

step "🔄 Feature 2: Navigation History"
info "Use the ← and → buttons to navigate through your history."
info "The breadcrumb shows your navigation path."
echo ""

step "🗄️ Feature 3: Live Vault Browsing"
info "Click on 'Vault Browser' (marked with 🔗)."
info "You'll see real files from your vault directory."
info "Files are formatted with proper sizes (B, KB, MB) and dates."
echo ""

step "💻 Feature 4: System Status"
info "Click on 'System Status' (marked with 🔗)."
info "This shows real-time API health and system information."
info "Status indicators show healthy/unhealthy states."
echo ""

step "🔄 Feature 5: Refresh Functionality"
info "Click the 🔄 button to refresh the current surface."
info "For data surfaces, this re-fetches the latest information."
info "Watch the loading indicator (🔄) during data fetch."
echo ""

step "❌ Feature 6: Error Handling"
info "Try stopping the API server (Ctrl+C in its terminal)."
info "Click on a data surface like 'Vault Browser'."
info "You'll see a graceful error message."
info "Restart the API server and refresh to see recovery."
echo ""

step "🎨 Feature 7: UI Enhancements"
info "Notice the professional dark theme with blue accents."
info "Hover over buttons to see smooth animations."
info "Scroll through surfaces to see custom scrollbars."
info "Resize your browser to see responsive design."
echo ""

step "📱 Feature 8: Mobile Responsiveness"
info "Make your browser window narrow (≤768px)."
info "The layout adapts with sidebar moving to the bottom."
info "Surface buttons switch to horizontal scrolling."
echo ""

# Step 5: Testing
title "Step 5: Running Tests"
step "Let's verify everything works with our test suite."
command "cd .. && python3 test_react_renderer_enhanced.py"
info "This runs 6 comprehensive tests."
echo ""

# Wait for user to run tests
read -p "Press Enter after running the tests..." -r

# Step 6: Advanced Features
title "Step 6: Advanced Features"
echo "For developers who want to extend the React Renderer:"
echo ""

step "🔧 Adding New Surfaces"
info "Edit: ui/src/views/surfaces/ReactRendererEnhanced.vue"
info "Add to the 'surfaces' array and create a new component."
echo ""

step "🎨 Customizing Styles"
info "Modify the <style> section in the same file."
info "Use CSS variables for consistent theming."
echo ""

step "🔗 Connecting to Different APIs"
info "Change API_BASE_URL constant to point to different endpoints."
info "Update surface definitions with new apiEndpoint values."
echo ""

# Conclusion
title "🎉 Demo Complete!"
echo "You've now seen all the features of the React Renderer v2.0:"
echo ""
echo "✅ Multi-surface management with React-style components"
echo "✅ Real data integration with uDosConnect API"
echo "✅ Professional UI with dark theme and animations"
echo "✅ Navigation history with back/forward support"
echo "✅ Live vault browsing and system monitoring"
echo "✅ Comprehensive error handling and loading states"
echo "✅ Responsive design for all screen sizes"
echo ""

echo "📚 Documentation: REACT_RENDERER_README.md"
echo "🧪 Tests: test_react_renderer_enhanced.py"
echo "🚀 Access: http://localhost:4173/surface/react-renderer"
echo ""

echo "Thank you for using uDosConnect React Renderer! 🚀"
