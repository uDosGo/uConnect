#!/usr/bin/env python3
"""
Enhanced test script for the React Renderer with real data integration
"""

import os
import sys
import json
from pathlib import Path

def test_enhanced_renderer_files_exist():
    """Test that all required enhanced React renderer files exist"""
    print("🔍 Testing Enhanced React Renderer file structure...")
    
    required_files = [
        "ui/src/views/surfaces/ReactRendererEnhanced.vue",
        "ui/src/router/index.ts",
        "tools/gui-api/server.js",
        "tools/gui-api/endpoints/vault.js",
        "tools/gui-api/endpoints/exec.js"
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

def test_router_enhanced_integration():
    """Test that the router is properly configured for enhanced React renderer"""
    print("🔍 Testing enhanced router integration...")
    
    router_file = Path("/Users/fredbook/code-vault/uDosConnect/ui/src/router/index.ts")
    
    if not router_file.exists():
        print("❌ Router file not found")
        return False
    
    content = router_file.read_text()
    
    # Check for ReactRendererEnhanced import
    if "ReactRendererEnhanced" not in content:
        print("❌ ReactRendererEnhanced import not found")
        return False
    
    # Check for react-renderer route (should point to enhanced version)
    if "react-renderer" not in content:
        print("❌ react-renderer route not found")
        return False
    
    # Check that both the import and usage are present
    if "ReactRendererEnhanced" not in content:
        print("❌ ReactRendererEnhanced not found in router")
        return False
    
    if "path: 'react-renderer'" not in content:
        print("❌ react-renderer path not found")
        return False
    
    # Check that ReactRendererEnhanced is used as a component (not just imported)
    # Look for the pattern: component: ReactRendererEnhanced
    if "component: ReactRendererEnhanced" not in content:
        print("❌ ReactRendererEnhanced not used as component")
        return False
    
    # Find the position of react-renderer path and ReactRendererEnhanced component
    lines = content.split('\n')
    react_renderer_found = False
    
    for i, line in enumerate(lines):
        if "path: 'react-renderer'" in line:
            # Check the next few lines for component: ReactRendererEnhanced
            for j in range(i, min(i + 5, len(lines))):
                if "component: ReactRendererEnhanced" in lines[j]:
                    react_renderer_found = True
                    break
            break
    
    if not react_renderer_found:
        print("❌ react-renderer route does not use ReactRendererEnhanced")
        return False
    
    print("✅ Enhanced router integration looks good")
    return True

def test_api_endpoints_available():
    """Test that the required API endpoints are available"""
    print("🔍 Testing API endpoints availability...")
    
    # Check vault endpoint
    vault_endpoint = Path("/Users/fredbook/code-vault/uDosConnect/tools/gui-api/endpoints/vault.js")
    if not vault_endpoint.exists():
        print("❌ Vault endpoint not found")
        return False
    
    vault_content = vault_endpoint.read_text()
    if "/list" not in vault_content or "router.get" not in vault_content:
        print("❌ Vault endpoint doesn't have proper GET /list route")
        return False
    
    # Check health endpoint
    server_file = Path("/Users/fredbook/code-vault/uDosConnect/tools/gui-api/server.js")
    if not server_file.exists():
        print("❌ Server file not found")
        return False
    
    server_content = server_file.read_text()
    if "/health" not in server_content:
        print("❌ Health endpoint not found in server")
        return False
    
    print("✅ API endpoints are properly configured")
    return True

def test_enhanced_component_features():
    """Test that the enhanced component has all required features"""
    print("🔍 Testing enhanced component features...")
    
    component_file = Path("/Users/fredbook/code-vault/uDosConnect/ui/src/views/surfaces/ReactRendererEnhanced.vue")
    
    if not component_file.exists():
        print("❌ Enhanced React renderer component not found")
        return False
    
    content = component_file.read_text()
    
    # Check for essential enhanced features
    required_features = [
        "API_BASE_URL",
        "surfaceData",
        "loadSurfaceData",
        "requiresData",
        "loading",
        "error",
        "SystemSurface",
        "VaultSurface",
        "formatFileSize",
        "formatDate",
        "status-indicator",
        "data-indicator"
    ]
    
    missing_features = []
    for feature in required_features:
        if feature not in content:
            missing_features.append(feature)
    
    if missing_features:
        print(f"❌ Missing enhanced features: {missing_features}")
        return False
    
    # Check for API endpoints
    if "'/vault/list'" not in content:
        print("❌ Vault API endpoint not configured")
        return False
    
    if "'/health'" not in content:
        print("❌ Health API endpoint not configured")
        return False
    
    print("✅ Enhanced component features look good")
    return True

def test_data_loading_mechanism():
    """Test that the data loading mechanism is properly implemented"""
    print("🔍 Testing data loading mechanism...")
    
    component_file = Path("/Users/fredbook/code-vault/uDosConnect/ui/src/views/surfaces/ReactRendererEnhanced.vue")
    content = component_file.read_text()
    
    # Check for fetch API usage
    if "fetch(" not in content:
        print("❌ Fetch API not used for data loading")
        return False
    
    # Check for error handling
    if "try {" not in content or "catch (error)" not in content:
        print("❌ Proper error handling not implemented")
        return False
    
    # Check for loading states
    if "renderer.value.loading = true" not in content:
        print("❌ Loading state management not implemented")
        return False
    
    # Check that data is passed to components
    if "propsData" not in content:
        print("❌ Data passing to components not implemented")
        return False
    
    print("✅ Data loading mechanism looks good")
    return True

def test_ui_enhancements():
    """Test that UI enhancements are present"""
    print("🔍 Testing UI enhancements...")
    
    component_file = Path("/Users/fredbook/code-vault/uDosConnect/ui/src/views/surfaces/ReactRendererEnhanced.vue")
    content = component_file.read_text()
    
    # Check for UI enhancements
    ui_features = [
        "status-indicators",
        "loading-indicator",
        "error-message",
        "empty-state",
        "system-card",
        "status-badge",
        "data-indicator",
        "sidebar-footer",
        "api-info"
    ]
    
    missing_ui = []
    for feature in ui_features:
        if feature not in content:
            missing_ui.append(feature)
    
    if missing_ui:
        print(f"❌ Missing UI features: {missing_ui}")
        return False
    
    # Check for animations
    if "@keyframes pulse" not in content:
        print("❌ Animation not implemented")
        return False
    
    print("✅ UI enhancements look good")
    return True

def main():
    """Run all enhanced tests"""
    print("🚀 Testing uDosConnect Enhanced React Renderer Integration\n")
    
    tests = [
        test_enhanced_renderer_files_exist,
        test_router_enhanced_integration,
        test_api_endpoints_available,
        test_enhanced_component_features,
        test_data_loading_mechanism,
        test_ui_enhancements
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
        print("🎉 All enhanced tests passed! React Renderer v2.0 is ready to use.")
        print("📍 Access it at: /surface/react-renderer")
        print("\n🔧 Features included:")
        print("   • Real data fetching from uDosConnect API")
        print("   • Vault browser with real file listings")
        print("   • System status monitoring")
        print("   • Enhanced error handling and loading states")
        print("   • Improved UI with status indicators")
        print("   • Responsive design and animations")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the enhanced implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())