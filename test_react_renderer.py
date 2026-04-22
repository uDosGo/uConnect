#!/usr/bin/env python3
"""
Test script for the React Renderer integration in uDosConnect
"""

import os
import sys
import subprocess
from pathlib import Path

def test_react_renderer_files_exist():
    """Test that all required React renderer files exist"""
    print("🔍 Testing React Renderer file structure...")
    
    required_files = [
        "ui/src/views/surfaces/ReactRendererActual.vue",
        "ui/src/router/index.ts",
        "react-renderer/package.json",
        "react-renderer/src/App.tsx",
        "react-renderer/src/App.css"
    ]
    
    base_path = Path("/Users/fredbook/code-vault/uDosConnect")
    missing_files = []
    
    for file_path in required_files:
        full_path = base_path / file_path
        if not full_path.exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    else:
        print("✅ All required files exist")
        return True

def test_router_integration():
    """Test that the router is properly configured for React renderer"""
    print("🔍 Testing router integration...")
    
    router_file = Path("/Users/fredbook/code-vault/uDosConnect/ui/src/router/index.ts")
    
    if not router_file.exists():
        print("❌ Router file not found")
        return False
    
    content = router_file.read_text()
    
    # Check for ReactRendererActual import
    if "ReactRendererActual" not in content:
        print("❌ ReactRendererActual import not found")
        return False
    
    # Check for react-renderer route
    if "react-renderer" not in content:
        print("❌ react-renderer route not found")
        return False
    
    print("✅ Router integration looks good")
    return True

def test_react_component_structure():
    """Test that the React renderer component has proper structure"""
    print("🔍 Testing React component structure...")
    
    component_file = Path("/Users/fredbook/code-vault/uDosConnect/ui/src/views/surfaces/ReactRendererActual.vue")
    
    if not component_file.exists():
        print("❌ React renderer component not found")
        return False
    
    content = component_file.read_text()
    
    # Check for essential React-style components
    required_elements = [
        "VibeSurface",
        "VaultSurface", 
        "GitHubSurface",
        "WordPressSurface",
        "USXDSurface",
        "WorkflowSurface",
        "navigateTo",
        "goBack",
        "goForward",
        "refresh"
    ]
    
    missing_elements = []
    for element in required_elements:
        if element not in content:
            missing_elements.append(element)
    
    if missing_elements:
        print(f"❌ Missing elements: {missing_elements}")
        return False
    
    print("✅ React component structure looks good")
    return True

def test_react_project_setup():
    """Test that the React project is properly set up"""
    print("🔍 Testing React project setup...")
    
    package_json = Path("/Users/fredbook/code-vault/uDosConnect/react-renderer/package.json")
    
    if not package_json.exists():
        print("❌ React project package.json not found")
        return False
    
    import json
    try:
        package_data = json.loads(package_json.read_text())
        
        # Check for essential React dependencies
        if "react" not in package_data.get("dependencies", {}):
            print("❌ React dependency not found")
            return False
            
        if "@vitejs/plugin-react" not in package_data.get("devDependencies", {}):
            print("❌ Vite React plugin not found")
            return False
            
        print("✅ React project setup looks good")
        return True
        
    except json.JSONDecodeError:
        print("❌ Invalid package.json format")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing uDosConnect React Renderer Integration\n")
    
    tests = [
        test_react_renderer_files_exist,
        test_router_integration,
        test_react_component_structure,
        test_react_project_setup
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
        print()
    
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! React Renderer is ready to use.")
        print("📍 Access it at: /surface/react-renderer")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())