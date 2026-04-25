# uDos Core System Fixes Documentation

## Overview
This document details the fixes and improvements made to the uDos core system components during the debugging session.

## Table of Contents
1. [uCode1 Core Fixes](#ucode1-core-fixes)
2. [MCP Protocol Fixes](#mcp-protocol-fixes)
3. [Socket Location Changes](#socket-location-changes)
4. [bash-doctor Skill Enhancements](#bash-doctor-skill-enhancements)
5. [full-stack-doctor Skill Implementation](#full-stack-doctor-skill-implementation)
6. [Re3Engine Fixes](#re3engine-fixes)
7. [Known Issues](#known-issues)

## uCode1 Core Fixes

### Compilation Errors Fixed

**Problem**: The uCode1 core failed to compile with multiple errors:
- `error[E0583]: file not found for module `tools``
- `error[E0422]: cannot find struct, variant or union type `SparkLaunchInput``
- Multiple similar errors for other MCP tools

**Root Cause**: The code was trying to import MCP tools from a local `mcp::tools` module that didn't exist. The actual MCP implementation is in the `ucode1-mcp` crate.

**Solution**: Updated import paths to use the correct crate:

1. **Fixed `src/tools/mod.rs`**: Changed imports from `crate::mcp::tools::*` to `ucode1_mcp::tools::*`
2. **Fixed `src/main.rs`**: Changed `use mcp::tools::*;` to `use ucode1_mcp::tools::*`
3. **Fixed `src/mcp/mod.rs`**: Removed non-existent `tools` module declaration

### Binary Specification

**Problem**: After adding the `mcp-http` binary to `Cargo.toml`, cargo didn't know which binary to run.

**Solution**: Updated the udos-core-doctor script to specify `--bin uCode1` when running cargo.

## MCP Protocol Fixes

### Request Format Correction

**Problem**: The udos-core-doctor script was sending MCP requests in the wrong format:
- Incorrect: `{"method":"ping"}`
- Expected: `"Ping"` (JSON string for unit variant)

**Root Cause**: The MCP protocol uses Rust enums with serde for JSON serialization. Unit variants like `Ping` serialize as JSON strings, not objects.

**Solution**: Updated the ping test in udos-core-doctor to use the correct format:
```bash
# Before (incorrect)
echo '{"method":"ping"}' | nc -U "$SOCKET_PATH"

# After (correct)
echo '"Ping"' | nc -U "$SOCKET_PATH"
```

**Response Format**: The correct response is `{"Success":{"data":{"result":"pong"}}}`

### Available MCP Methods

The MCP protocol supports these request variants:
- `"Ping"` - Health check
- `"Status"` - Get system status
- `"Shutdown"` - Graceful shutdown
- `"ListNotes"` - List available notes
- `"ReadNote"` - Read a specific note
- `"SearchNotes"` - Search notes
- `"ClassifyIntent"` - NLP intent classification

## Socket Location Changes

### uCode1 Core (MCP Server)

**Old Location**: `~/.uds/control.sock`
**New Location**: `~/Code/Vault/.uds/mcp.sock`

**Dev Mode**: `~/Code/Vault/.uds/dev/mcp.sock`

**Reason**: The MCP server now creates sockets relative to the vault path for better organization and security.

### Re3Engine

**Standard Location**: `~/.uds/re3engine.sock`
**Dev Mode**: `~/.uds/dev/re3engine.sock`

**Determination**: Controlled by `UDOS_DEV_MODE` environment variable. If set (to any value), uses dev mode.

## bash-doctor Skill Enhancements

### New Features

1. **Color-coded output** for better readability
2. **Comprehensive validation checks**:
   - Syntax validation with `bash -n`
   - Executable permission checks
   - Shebang verification
   - macOS compatibility checks (sed, timeout vs gtimeout)
   - Code quality analysis
   - Dependency checking
   - Best practice recommendations

3. **macOS-specific checks**:
   - Linux package manager detection (apt-get, yum, dnf, systemctl)
   - sed -i compatibility warnings
   - timeout vs gtimeout recommendations

4. **Security checks**:
   - Dangerous `rm -rf` patterns detection
   - Unquoted variable warnings

### Usage Examples

```bash
# Validate a single script
bash-doctor --file script.sh

# Validate all scripts in a directory
bash-doctor --dir ~/Code/uDosGo/scripts

# Show help
bash-doctor --help
```

## full-stack-doctor Skill Implementation

### Features

- **Comprehensive stack validation**: Re3Engine, uCode1 core, ThinUI, Re3Chat
- **Flexible modes**: `--dev` for development, `--continue-on-error` for full reporting
- **Detailed status reporting**: Shows which components are running and their endpoints
- **Error handling**: Can stop on first failure or continue and report all issues

### Usage

```bash
# Run all doctors, stop on first failure
full-stack-doctor

# Run all doctors, report all issues
full-stack-doctor --continue-on-error

# Run in development mode
full-stack-doctor --dev
```

### Component Status

- **uCode1 core**: ✅ Running successfully
- **ThinUI**: ✅ Running on port 3001
- **Re3Engine**: ⚠️ Directory issue fixed, but process management needs work
- **Re3Chat**: ❌ HTTP 500 error (React Server Components issue)

## Re3Engine Fixes

### Directory Path Correction

**Problem**: Re3Engine doctor was looking in `~/Code/uDosGo/Re3Engine` but the actual location is `~/Code/Tools/Re3Engine`

**Solution**: Updated the doctor script to use the correct path.

### Environment Variable Handling

**Problem**: Re3Engine checks if `UDOS_DEV_MODE` is set (`.is_ok()`), not its value. So even `UDOS_DEV_MODE=0` enables dev mode.

**Solution**: Use `UDOS_DEV_MODE=1` for dev mode, unset or don't set for production mode.

## Known Issues

### Re3Chat HTTP 500 Error

**Problem**: Re3Chat returns HTTP 500 with error:
```
You're importing a module that depends on `useState` into a React Server Component module. This API is only available in Client Components.
```

**Location**: `ThemeContext.tsx` using `useState` in a component imported by a Server Component.

**Solution**: Add `"use client"` directive to `ThemeContext.tsx` or its parent component.

### Re3Engine Process Management

**Problem**: Re3Engine process starts but may crash silently after socket creation.

**Status**: Needs further investigation when Re3Engine development resumes.

## Summary of Changes

### Files Modified

1. **uCode1 Core**:
   - `src/tools/mod.rs` - Fixed import paths
   - `src/main.rs` - Fixed import paths
   - `src/mcp/mod.rs` - Removed non-existent module

2. **udos-core-doctor**:
   - Fixed socket paths to use vault directory
   - Fixed MCP protocol format
   - Added proper binary specification

3. **bash-doctor**:
   - Enhanced with color output and comprehensive checks

4. **full-stack-doctor**:
   - New implementation for stack-wide validation

5. **re3engine-doctor**:
   - Fixed Re3Engine directory path
   - Improved environment variable handling

### Current Status

- ✅ **uCode1 core**: Fully operational with MCP server
- ✅ **ThinUI**: Running and responding
- ⚠️ **Re3Engine**: Path fixed, needs process management work
- ❌ **Re3Chat**: React Server Components issue needs fixing

## Next Steps

1. **Fix Re3Chat**: Add `"use client"` directive to ThemeContext
2. **Investigate Re3Engine**: Debug process crashes
3. **Test integration**: Verify MCP communication between components
4. **Documentation**: Update architecture diagrams with new socket locations

## Testing Commands

### Verify uCode1 Core
```bash
# Check if running
ps aux | grep uCode1

# Test MCP ping
echo '"Ping"' | nc -U ~/Code/Vault/.uds/mcp.sock

# Test status
echo '"Status"' | nc -U ~/Code/Vault/.uds/mcp.sock
```

### Verify ThinUI
```bash
# Check if running
curl -s http://localhost:3001

# Or open in browser
open http://localhost:3001
```

### Run Full Stack Doctor
```bash
# Quick check (stops on first failure)
full-stack-doctor

# Full report (continues on errors)
full-stack-doctor --continue-on-error
```

## References

- MCP Protocol: `uCode1/mcp/src/lib.rs`
- uCode1 Core: `uCode1/src/main.rs`
- Re3Engine: `Tools/Re3Engine/src/mcp/mod.rs`
- Doctor scripts: `~/.vibe/skills/*/doctor.sh`