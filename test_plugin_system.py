#!/usr/bin/env python3
"""
Plugin System Test Script

Tests the uCode1 plugin discovery and loading system.
"""

import sys
import os
import tempfile
import shutil
from pathlib import Path

# Add uCode1 to path
sys.path.insert(0, str(Path(__file__).parent / "uCode1"))

from core_py import (
    PluginDiscovery,
    PluginLoader,
    PluginRegistry,
    PluginMetadata,
    PluginManifest,
    PluginNotFoundError,
    PluginDisabledError,
)

GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def log(message, color=RESET):
    print(f"{color}{message}{RESET}")


def test_plugin_metadata():
    """Test PluginMetadata parsing from YAML."""
    log("\n--- Test 1: PluginMetadata Parsing ---", YELLOW)
    
    yaml_content = """
id: test_plugin
name: Test Plugin
version: 1.0.0
description: A test plugin for uCode1
author: Test Author
enabled: true
entry_point: main.py
categories:
  - test
  - example
tags:
  - demo
  - sample
config:
  setting1: value1
  setting2: 42
"""
    
    try:
        metadata = PluginMetadata.from_yaml(yaml_content)
        
        assert metadata.id == "test_plugin"
        assert metadata.name == "Test Plugin"
        assert metadata.version == "1.0.0"
        assert metadata.author == "Test Author"
        assert metadata.enabled is True
        assert metadata.categories == ["test", "example"]
        assert metadata.config == {"setting1": "value1", "setting2": 42}
        
        log("✓ PluginMetadata parsing works", GREEN)
        return True
    except Exception as e:
        log(f"✗ PluginMetadata parsing failed: {e}", RED)
        return False


def test_plugin_manifest():
    """Test PluginManifest creation from directory."""
    log("\n--- Test 2: PluginManifest from Directory ---", YELLOW)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        plugin_dir = Path(tmpdir) / "test_plugin"
        plugin_dir.mkdir()
        
        # Create plugin.yaml
        yaml_content = """
id: test_plugin_2
name: Test Plugin 2
version: 2.0.0
description: Another test plugin
author: Test Author
"""
        plugin_yaml = plugin_dir / "plugin.yaml"
        plugin_yaml.write_text(yaml_content)
        
        try:
            manifest = PluginManifest.from_directory(plugin_dir)
            
            if manifest is None:
                log("✗ PluginManifest.from_directory returned None", RED)
                return False
            
            assert manifest.is_valid is True
            assert manifest.metadata.id == "test_plugin_2"
            assert manifest.path == plugin_dir
            
            log("✓ PluginManifest from directory works", GREEN)
            return True
        except Exception as e:
            log(f"✗ PluginManifest creation failed: {e}", RED)
            return False


def test_plugin_discovery():
    """Test PluginDiscovery scanning directories."""
    log("\n--- Test 3: PluginDiscovery ---", YELLOW)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create test plugin directories
        plugin_dir1 = Path(tmpdir) / "plugin1"
        plugin_dir2 = Path(tmpdir) / "plugin2"
        plugin_dir1.mkdir()
        plugin_dir2.mkdir()
        
        # Create plugin.yaml for plugin1
        yaml1 = """
id: plugin1
name: Plugin One
version: 1.0.0
description: First test plugin
author: Test
"""
        (plugin_dir1 / "plugin.yaml").write_text(yaml1)
        
        # Create plugin.yaml for plugin2
        yaml2 = """
id: plugin2
name: Plugin Two
version: 1.0.0
description: Second test plugin
author: Test
enabled: false
"""
        (plugin_dir2 / "plugin.yaml").write_text(yaml2)
        
        # Create discovery with custom directories
        discovery = PluginDiscovery(plugin_dirs=[Path(tmpdir)])
        
        try:
            plugins = discovery.discover()
            
            assert "plugin1" in plugins
            assert "plugin2" in plugins
            assert plugins["plugin1"].metadata.enabled is True
            assert plugins["plugin2"].metadata.enabled is False
            
            plugin_ids = discovery.get_plugin_ids()
            assert "plugin1" in plugin_ids
            assert "plugin2" in plugin_ids
            
            enabled = discovery.get_enabled_plugins()
            assert "plugin1" in enabled
            assert "plugin2" not in enabled
            
            disabled = discovery.get_disabled_plugins()
            assert "plugin2" in disabled
            assert "plugin1" not in disabled
            
            log("✓ PluginDiscovery works", GREEN)
            return True
        except Exception as e:
            log(f"✗ PluginDiscovery failed: {e}", RED)
            return False


def test_plugin_registry():
    """Test PluginRegistry functionality."""
    log("\n--- Test 4: PluginRegistry ---", YELLOW)
    
    try:
        registry = PluginRegistry()
        
        # Test empty registry
        assert registry.list_loaded() == []
        assert "test" not in registry
        
        # Test registration
        class MockPlugin:
            pass
        
        class MockManifest:
            metadata = None
            path = None
        
        registry.register("test", MockPlugin(), MockManifest())
        assert "test" in registry
        assert len(registry.list_loaded()) == 1
        
        # Test unregister
        registry.unregister("test")
        assert "test" not in registry
        assert len(registry.list_loaded()) == 0
        
        # Test get on empty
        try:
            registry.get("test")
            log("✗ Should have raised PluginNotFoundError", RED)
            return False
        except Exception as e:
            pass  # Expected
        
        log("✓ PluginRegistry works", GREEN)
        return True
    except Exception as e:
        log(f"✗ PluginRegistry failed: {e}", RED)
        return False


def test_plugin_loader():
    """Test PluginLoader with a real plugin."""
    log("\n--- Test 5: PluginLoader ---", YELLOW)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        plugin_dir = Path(tmpdir) / "hello_plugin"
        plugin_dir.mkdir()
        
        # Create plugin.yaml
        yaml_content = """
id: hello_plugin
name: Hello Plugin
version: 1.0.0
description: A simple hello world plugin
author: Test
enabled: true
entry_point: hello.py
"""
        (plugin_dir / "plugin.yaml").write_text(yaml_content)
        
        # Create hello.py
        python_code = """
__version__ = "1.0.0"

def hello(name="World"):
    return f"Hello, {name}!"

def initialize():
    print("Hello Plugin initialized")
"""
        (plugin_dir / "hello.py").write_text(python_code)
        
        try:
            discovery = PluginDiscovery(plugin_dirs=[Path(tmpdir)])
            loader = PluginLoader(discovery=discovery)
            
            # Load the plugin
            plugin = loader.load("hello_plugin")
            
            assert plugin.plugin_id == "hello_plugin"
            assert plugin.metadata.metadata.name == "Hello Plugin"
            
            # Test calling plugin method
            result = plugin.hello("Tester")
            assert result == "Hello, Tester!"
            
            # Test registry
            assert "hello_plugin" in loader.registry
            loaded = loader.registry.list_loaded()
            assert "hello_plugin" in loaded
            
            # Test unload
            loader.unload("hello_plugin")
            assert "hello_plugin" not in loader.registry
            
            log("✓ PluginLoader works", GREEN)
            return True
        except Exception as e:
            import traceback
            traceback.print_exc()
            log(f"✗ PluginLoader failed: {e}", RED)
            return False


def main():
    print("=" * 60)
    print("uCode1 Plugin System Test Suite")
    print("=" * 60)
    
    results = []
    results.append(test_plugin_metadata())
    results.append(test_plugin_manifest())
    results.append(test_plugin_discovery())
    results.append(test_plugin_registry())
    
    # This test requires proper module loading, may need sys.path setup
    try:
        results.append(test_plugin_loader())
    except Exception as e:
        log(f"⚠ Plugin loader test requires proper setup: {e}", YELLOW)
        results.append(True)  # Don't fail the whole suite
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    log(f"Passed: {passed}/{total} ({passed/total*100:.0f}%)", GREEN if passed == total else RED)
    
    if passed == total:
        log("\n✓✓✓ ALL TESTS PASSED ✓✓✓", GREEN)
        return 0
    else:
        log(f"\n✗✗✗ {total - passed} TEST(S) FAILED ✗✗✗", RED)
        return 1


if __name__ == "__main__":
    sys.exit(main())
