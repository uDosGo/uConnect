#!/bin/bash

# Simple script to test the WASM build
cd /Users/fredbook/Code/uDosGo/retro-blitz

echo "🔍 Checking WASM build artifacts..."
if [ -f "pkg/retro_blitz.js" ] && [ -f "pkg/retro_blitz_bg.wasm" ]; then
    echo "✅ WASM build successful - JavaScript and WASM files exist"
    
    # Check file sizes
    js_size=$(wc -c < "pkg/retro_blitz.js")
    wasm_size=$(wc -c < "pkg/retro_blitz_bg.wasm")
    
    echo "📊 JavaScript bundle: $js_size bytes"
    echo "📊 WASM module: $wasm_size bytes"
    
    # Check if the HTML test file exists
    if [ -f "examples/wasm_test.html" ]; then
        echo "✅ HTML test file ready at examples/wasm_test.html"
        echo "🚀 You can test by running:"
        echo "   python3 -m http.server 8000"
        echo "   Then visit: http://localhost:8000/examples/wasm_test.html"
    else
        echo "❌ HTML test file not found"
    fi
else
    echo "❌ WASM build failed - missing required files"
    exit 1
fi