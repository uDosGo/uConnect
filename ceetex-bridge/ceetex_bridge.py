#!/usr/bin/env python3
"""
CEETEX Bridge for uDos
Sidecar process that runs CEETEX and communicates with Tauri app
"""

import json
import sys
import asyncio
import os
from pathlib import Path

# Add CEETEX to path
sys.path.insert(0, str(Path(__file__).parent.parent / "Vendor" / "CEETEX"))

# Import CEETEX components
from ceetex import CeetexApp

def parse_teletext_output(text):
    """
    Parse CEETEX terminal output into grid format
    Returns 40x25 grid with color information
    """
    lines = text.split('\n')[:25]  # Take first 25 lines
    grid = []
    
    for line in lines:
        # Simple parsing - CEETEX uses ANSI colors
        # Convert to our format: "color:char"
        row = []
        for char in line[:40]:  # Take first 40 chars
            # Default to green (teletext style)
            color = "green"
            if char == " ":
                color = "black"
            row.append(f"{color}:{char}")
        # Pad row to 40 characters
        while len(row) < 40:
            row.append("black: ")
        grid.append(row)
    
    # Pad grid to 25 rows
    while len(grid) < 25:
        grid.append(["black: " for _ in range(40)])
    
    return grid

async def main():
    print("CEETEX Bridge started", flush=True)
    
    # Initialize CEETEX app
    app = CeetexApp()
    
    # Load default pages
    await app.load_pages()
    
    # Main command loop
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            
            try:
                cmd = json.loads(line.strip())
                
                if cmd.get('action') == 'get_page':
                    page_code = cmd.get('code', 100)
                    
                    # Get page from CEETEX
                    page_content = await app.get_page_content(page_code)
                    
                    # Parse into grid format
                    grid = parse_teletext_output(page_content)
                    
                    # Get navigation links
                    navigation = await app.get_navigation(page_code)
                    
                    response = {
                        "grid": grid,
                        "navigation": navigation,
                        "current_page": page_code,
                        "success": True
                    }
                    
                    print(json.dumps(response), flush=True)
                    
                elif cmd.get('action') == 'open_url':
                    url = cmd.get('url')
                    # In a real implementation, this would open the browser
                    # For now, just acknowledge
                    print(json.dumps({"success": True, "url": url}), flush=True)
                    
                else:
                    print(json.dumps({"error": "Unknown command", "success": False}), flush=True)
                    
            except json.JSONDecodeError:
                print(json.dumps({"error": "Invalid JSON", "success": False}), flush=True)
            except Exception as e:
                print(json.dumps({"error": str(e), "success": False}), flush=True)
                
        except KeyboardInterrupt:
            break
    
    print("CEETEX Bridge stopped", flush=True)

if __name__ == '__main__':
    asyncio.run(main())