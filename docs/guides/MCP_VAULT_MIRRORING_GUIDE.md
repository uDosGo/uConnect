# MCP Vault Mirroring Guide

## Overview

This guide helps you mirror your vault Markdown documentation to the Le Chat library using MCP (Mistral Custom Protocol). This allows Le Chat to access and serve your documentation directly.

## Prerequisites

1. **Vault Documentation**: Markdown files in your vault
2. **MCP Server**: Node.js/Python server to expose documentation
3. **Le Chat Access**: Access to Le Chat with `/mcp` commands
4. **ngrok**: For local testing (optional)

## Step 1: Set Up MCP Server

Create a simple MCP server to expose your vault documentation:

```javascript
// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// MCP Manifest
app.get('/mcp/manifest', (req, res) => {
  res.json({
    name: "uDos Vault Mirror",
    version: "1.0",
    description: "Mirror uDos vault documentation to Le Chat",
    commands: [
      {
        name: "list_docs",
        description: "List all documents in the vault",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to scan for documents",
              default: "."
            }
          }
        }
      },
      {
        name: "get_doc",
        description: "Get a specific document",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the document",
              required: true
            }
          }
        }
      },
      {
        name: "search_docs",
        description: "Search documents by keyword",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
              required: true
            }
          }
        }
      }
    ]
  });
});

// List documents
app.post('/mcp/list_docs', (req, res) => {
  const { path = '.' } = req.body;
  
  try {
    const files = getMarkdownFiles(path);
    res.json({
      success: true,
      files: files.map(f => ({ path: f }))
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get document
app.post('/mcp/get_doc', (req, res) => {
  const { path } = req.body;
  
  try {
    const content = fs.readFileSync(path, 'utf8');
    res.json({
      success: true,
      path,
      content
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Search documents
app.post('/mcp/search_docs', (req, res) => {
  const { query } = req.body;
  
  try {
    const files = getMarkdownFiles('.');
    const results = files
      .map(f => ({
        path: f,
        content: fs.readFileSync(f, 'utf8')
      }))
      .filter(doc => doc.content.includes(query));
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Helper: Get all markdown files
function getMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  let results = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

app.listen(3000, () => {
  console.log('MCP Vault Mirror server running on port 3000');
});
```

## Step 2: Expose Server with ngrok

```bash
# Install ngrok
brew install ngrok/ngrok/ngrok

# Expose local server
ngrok http 3000

# Note the HTTPS URL (e.g., https://abc123.ngrok.io)
```

## Step 3: Register with Le Chat

In Le Chat, register your MCP server:

```
/mcp register https://abc123.ngrok.io/mcp/manifest
```

**Expected Response**:
```
✅ MCP server registered: uDos Vault Mirror
```

## Step 4: Test MCP Commands

### List Documents
```
/mcp uDosVaultMirror.list_docs
```

### Get Document
```
/mcp uDosVaultMirror.get_doc {"path": "path/to/document.md"}
```

### Search Documents
```
/mcp uDosVaultMirror.search_docs {"query": "search term"}
```

## Step 5: Automate Mirroring

Create a script to automatically mirror new documents:

```bash
#!/bin/bash

# Mirror new documents
find . -name "*.md" -newer last_mirror.txt | while read file; do
  echo "Mirroring $file..."
  /mcp uDosVaultMirror.get_doc {"path": "$file"}
done

# Update timestamp
touch last_mirror.txt
```

## Step 6: Verify Mirroring

Check that documents are accessible in Le Chat:

```
/mcp list
```

**Expected Response**:
```
Registered MCP Servers:
1. uDos Vault Mirror (https://abc123.ngrok.io)
   - list_docs
   - get_doc
   - search_docs
```

## Troubleshooting

### Issue: "No MCP custom connections found"
**Solution**: Register your MCP server first (`/mcp register`)

### Issue: Server not reachable
**Solution**: Check ngrok URL and server logs

### Issue: Invalid manifest
**Solution**: Validate manifest JSON structure

### Issue: CORS errors
**Solution**: Add CORS headers to server

## Next Steps

1. **Deploy Server**: Move from ngrok to production URL
2. **Automate Updates**: Set up webhooks for document changes
3. **Monitor Usage**: Track MCP command usage
4. **Expand Features**: Add more commands as needed

---

**Status**: Ready to mirror
**Next Steps**: Set up server and register with Le Chat

---

**Generated by Mistral Vibe**
**Co-Authored-By: Mistral Vibe <vibe@mistral.ai>**
