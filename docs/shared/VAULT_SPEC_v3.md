# uDOS Core Vault Specification v3.0

**Version:** 3.0.0  
**Status:** Unified Layered Vault Architecture  
**Repository Home:** `~/Code/`  
**Sync Strategy:** GitHub (user + org)  
**MCP Integration:** Full  

---

## 1. Layered Vault Architecture

All vaults now live in `~/Code/` and **layer transparently** into a single unified Vault experience.

```yaml
vault_architecture_v3:
  base_path: "~/Code/"
  
  layers:
    - name: "vault-user"
      repo: "github.com/fredporter/vault-user"
      path: "~/Code/vault-user/"
      layer: "user"           # Top layer (user wins conflicts)
      sync: "git push/pull"
      
    - name: "vault-shared"
      repo: "github.com/fredporter/vault-shared"
      path: "~/Code/vault-shared/"
      layer: "shared"         # Middle layer
      sync: "git + uServer"
      
    - name: "vault-global"
      repo: "github.com/uDosGo/vault-global"
      path: "~/Code/vault-global/"
      layer: "global"         # Base layer (read-only, overlaid)
      sync: "pull-only from org"
```

### 1.1 Unified Vault Experience

All three vaults **merge at runtime** into a single virtual vault:

```yaml
unified_view:
  virtual_path: "~/Vault/"    # Obsidian opens this
  layers:
    - source: "~/Code/vault-user/"
      priority: 100            # Highest - user edits go here
      merge_strategy: "overlay"
      
    - source: "~/Code/vault-shared/"
      priority: 50
      merge_strategy: "merge"  # Conflicts resolved by rules
      
    - source: "~/Code/vault-global/"
      priority: 0              # Lowest - base knowledge
      merge_strategy: "reference"  # Read-only, can be extended

  # Union file system behavior
  behavior:
    read: "union"              # See all layers
    write: "copy-up"           # Writes go to user layer
    delete: "whiteout"         # Marks deleted in user layer
```

### 1.2 Directory Structure (GitHub Ready)

```
~/Code/
├── vault-user/                      # github.com/fredporter/vault-user
│   ├── .git/
│   ├── .obsidian/
│   ├── README.md
│   ├── workspaces/
│   ├── orbs/
│   ├── daily/
│   ├── journals/
│   └── attachments/
│
├── vault-shared/                    # github.com/fredporter/vault-shared
│   ├── .git/
│   ├── .obsidian/
│   ├── README.md
│   ├── @public/                     # Web-publish zone
│   ├── @sigs/                       # Special Interest Groups
│   │   ├── ai-research/
│   │   ├── indie-dev/
│   │   └── knowledge-graph/
│   ├── @collab/                     # Active collaborations
│   └── orbs/
│
├── vault-global/                    # github.com/uDosGo/vault-global
│   ├── .git/
│   ├── .obsidian/
│   ├── README.md
│   ├── categories/                  # Global Knowledge Categories
│   ├── schemas/
│   ├── orbs/                        # Global topic orbs
│   └── CHANGELOG.md
│
└── .union/                          # Union filesystem cache
    ├── overlay/
    └── whiteouts/
```

---

## 2. Global Knowledge Categories

The **vault-global** provides foundational knowledge organized into 12 primary categories:

```yaml
global_knowledge_categories:
  version: "1.0.0"
  source: "github.com/uDosGo/vault-global"
  
  categories:
    # Technology & Computing
    - id: "cs"
      name: "Computer Science"
      icon: "💻"
      subcategories:
        - "algorithms"
        - "data-structures"
        - "programming-languages"
        - "software-architecture"
        - "distributed-systems"
        
    - id: "ai"
      name: "Artificial Intelligence"
      icon: "🧠"
      subcategories:
        - "machine-learning"
        - "deep-learning"
        - "llm"
        - "computer-vision"
        - "nlp"
        - "ai-agents"
        
    - id: "dev"
      name: "Development"
      icon: "🛠️"
      subcategories:
        - "web-dev"
        - "mobile-dev"
        - "devops"
        - "testing"
        - "security"
        
    - id: "data"
      name: "Data Science"
      icon: "📊"
      subcategories:
        - "analytics"
        - "visualization"
        - "databases"
        - "data-engineering"
        
    # Science & Nature
    - id: "physics"
      name: "Physics"
      icon: "⚛️"
      subcategories:
        - "quantum"
        - "classical"
        - "astrophysics"
        - "thermodynamics"
        
    - id: "biology"
      name: "Biology"
      icon: "🧬"
      subcategories:
        - "molecular"
        - "neuroscience"
        - "ecology"
        - "genetics"
        
    - id: "math"
      name: "Mathematics"
      icon: "📐"
      subcategories:
        - "calculus"
        - "linear-algebra"
        - "statistics"
        - "logic"
        
    # Human & Society
    - id: "philosophy"
      name: "Philosophy"
      icon: "💭"
      subcategories:
        - "epistemology"
        - "ethics"
        - "metaphysics"
        - "mind"
        
    - id: "psychology"
      name: "Psychology"
      icon: "🧠"
      subcategories:
        - "cognitive"
        - "behavioral"
        - "social"
        - "clinical"
        
    - id: "economics"
      name: "Economics"
      icon: "📈"
      subcategories:
        - "macro"
        - "micro"
        - "finance"
        - "crypto"
        
    - id: "history"
      name: "History"
      icon: "📜"
      subcategories:
        - "ancient"
        - "modern"
        - "technology-history"
        - "scientific-revolution"
        
    # Creative & Practical
    - id: "design"
      name: "Design"
      icon: "🎨"
      subcategories:
        - "ui-ux"
        - "graphic"
        - "interaction"
        - "design-systems"
        
    - id: "product"
      name: "Product"
      icon: "🚀"
      subcategories:
        - "product-management"
        - "user-research"
        - "metrics"
        - "growth"
        
    - id: "business"
      name: "Business"
      icon: "🏢"
      subcategories:
        - "strategy"
        - "marketing"
        - "operations"
        - "entrepreneurship"
```

### 2.1 Global Orb Structure

Each category contains **orbs** (topic nodes) that provide structured knowledge:

```yaml
# vault-global/categories/ai/llm/_orb.yaml
---
type: orb
version: "3.0.0"
category: "ai"
subcategory: "llm"
name: "Large Language Models"
canonical: "https://udos.global/ai/llm"

# Orb metadata
description: |
  Comprehensive knowledge base for Large Language Models,
  including architecture, training, inference, and applications.

# Knowledge graph connections
connections:
  parents:
    - orb: "cs://machine-learning/deep-learning"
    - orb: "ai://transformers"
  children:
    - orb: "ai://llm/prompt-engineering"
    - orb: "ai://llm/rag"
    - orb: "ai://llm/fine-tuning"
  related:
    - orb: "cs://natural-language-processing"
    - orb: "data://vector-databases"

# MCP operations
mcp:
  operations:
    - "query_knowledge"
    - "get_papers"
    - "list_implementations"
    - "get_timeline"
    
# GitHubNext integration
githubnext:
  enabled: true
  repo_tools:
    - "code-search"
    - "semantic-index"
    - "llm-context"
    - "knowledge-mapper"
  embeddings: true
  vector_store: "~/Code/.union/embeddings/"
```

---

## 3. Orb (Node) Structure & Cross-Linking

Orbs are the atomic knowledge units that span all three vault layers:

### 3.1 Orb Specification

```yaml
# Any *_orb.yaml file defines an orb
---
type: orb
version: "3.0.0"

# Identity
id: "uuid-or-canonical"
name: "Human readable name"
canonical: "udos://category/subcategory/orb-name"

# Layer tracking
source_layer: "user|shared|global"
origin_repo: "github.com/.../vault-{layer}"
synced: timestamp

# Content
description: "What this orb contains"
keywords: ["searchable", "tags"]

# Relationships (Obsidian compatible)
links:
  wikilinks: "[[Other Orb]]"  # Works in Obsidian
  udos_links: "udos://category/orb"  # uDOS protocol
  
# Knowledge graph
parents: ["parent-orb-1", "parent-orb-2"]
children: ["child-orb-1"]
related: ["related-orb-1", "related-orb-2"]

# MCP context
mcp:
  operations: ["list", "get", "query", "create", "update"]
  context_window: "knowledge"
  
# GitHubNext
githubnext:
  semantic_search: true
  llm_context_pack: true
  code_references: true
```

### 3.2 Cross-Linking Examples

```markdown
# In ~/Code/vault-user/orbs/my-project/README.md

## Related Knowledge

This project builds on:
- [[udos://ai/llm/prompt-engineering]] (from vault-global)
- [[vault-shared://@sigs/ai-research/best-practices]] (from shared SIG)
- [[My Previous Work]] (local user orb)

Using Obsidian wikilinks:
- [[Global LLM Knowledge]] 
- [[Shared SIG Guidelines]]
- [[User Project Notes]]

With uDOS explicit links:
- `udos://ai/llm/rag`
- `shared://@sigs/indie-dev/tooling`
- `user://workspaces/default/current`
```

---

## 4. MCP (Machine-Consumable Protocol) Operations

### 4.1 MCP Instruction Set

```yaml
mcp_v3:
  version: "1.0.0"
  base_url: "udos://mcp/v1"
  
  operations:
    # Orb operations
    orb:
      list: "GET /orbs/{layer}/{category}"
      get: "GET /orb/{canonical}"
      query: "POST /orbs/query"
      create: "POST /orbs/{layer}"  # writes to user layer
      update: "PUT /orb/{id}"
      link: "POST /orb/{id}/links"
      
    # Knowledge operations
    knowledge:
      search: "POST /knowledge/search"
      traverse: "GET /knowledge/graph/{orb_id}"
      similarity: "POST /knowledge/similar"
      context: "GET /knowledge/context/{orb_id}"
      
    # GitHubNext integration
    githubnext:
      semantic_index: "POST /githubnext/index"
      code_context: "GET /githubnext/code/{repo}/{path}"
      llm_pack: "GET /githubnext/llm/{orb_id}"
      repo_map: "GET /githubnext/map/{owner}/{repo}"
      
    # Publishing
    publish:
      to_shared: "POST /publish/to-shared"
      to_public: "POST /publish/public"
      request_global: "POST /publish/request-global"
```

### 4.2 MCP Response Format

```json
{
  "mcp_version": "1.0.0",
  "operation": "knowledge/context",
  "orb_id": "udos://ai/llm/rag",
  "response": {
    "content": {
      "summary": "Retrieval-Augmented Generation combines LLMs with vector search...",
      "key_concepts": ["retrieval", "embedding", "generation", "knowledge-base"],
      "papers": [
        {"title": "RAG: Retrieval-Augmented Generation...", "url": "..."}
      ],
      "implementations": [
        {"framework": "LangChain", "example": "..."},
        {"framework": "LlamaIndex", "example": "..."}
      ]
    },
    "graph": {
      "parents": ["udos://ai/llm", "udos://data/vector-databases"],
      "children": ["udos://ai/rag/agentic"],
      "related": ["udos://ai/fine-tuning", "udos://ai/prompt-engineering"]
    },
    "githubnext": {
      "repositories": [
        {"name": "langchain-ai/langchain", "relevance": 0.95},
        {"name": "run-llama/llama_index", "relevance": 0.92}
      ],
      "code_examples": ["link/to/code"],
      "llm_context": "base64-encoded-context-pack"
    }
  }
}
```

---

## 5. GitHub Sync & GitHubNext Integration

### 5.1 Repository Configuration

```yaml
# ~/.config/udos/github.yaml
---
user: "fredporter"
org: "uDosGo"

repositories:
  vault-user:
    repo: "fredporter/vault-user"
    branch: "main"
    sync: "mirror"  # Full bidirectional
    backup: true
    
  vault-shared:
    repo: "fredporter/vault-shared"
    branch: "main"
    sync: "conditional"  # Rules-based
    backup: true
    
  vault-global:
    repo: "uDosGo/vault-global"
    branch: "stable"
    sync: "pull-only"
    backup: false  # Source of truth
    
githubnext:
  enabled: true
  features:
    - "semantic-search"
    - "code-referencing"
    - "llm-context-packs"
    - "knowledge-mapping"
  indexing:
    repositories: ["fredporter/*", "uDosGo/*"]
    schedule: "on-change"
    embeddings_model: "text-embedding-3-small"
```

### 5.2 GitHubNext Tool Integration

```yaml
# GitHubNext workflow for uDOS
githubnext:
  tools:
    - name: "knowledge-mapper"
      type: "visualization"
      inputs:
        - "orb_id"
        - "depth"
      output: "knowledge_graph.json"
      
    - name: "llm-context-builder"
      type: "llm"
      inputs:
        - "query"
        - "layers"  # user, shared, global
      output: "context_pack.json"
      
    - name: "project-mapper"
      type: "mapping"
      inputs:
        - "project_path"
      output: "project_knowledge.md"
      
    - name: "similarity-finder"
      type: "search"
      inputs:
        - "content"
        - "vault_layers"
      output: "related_orbs.json"
```

---

## 6. Union Filesystem Implementation

### 6.1 OverlayFS Configuration

```bash
# uDOS union mount script
#!/bin/bash

# Layers from lowest to highest
LAYERS="
~/Code/vault-global:ro
~/Code/vault-shared:rw
~/Code/vault-user:rw
"

# Union mount at ~/Vault/
unionfs -o cow $LAYERS ~/Vault/

# Obsidian opens ~/Vault/ as a single vault
open -a Obsidian ~/Vault/
```

### 6.2 Conflict Resolution

```yaml
# ~/.config/udos/union.yaml
---
merge_rules:
  # File conflicts (same path in multiple layers)
  conflict_strategy: "highest-priority-wins"
  
  # Orb merges (merge content intelligently)
  orb_merge:
    user_layer: "overwrite"           # User edits take precedence
    shared_layer: "merge-frontmatter" # Merge metadata
    global_layer: "reference-only"    # Cannot modify
    
  # Whiteout files (deleted in higher layer)
  whiteout_suffix: ".udos_whiteout"
  auto_cleanup: true
```

---

## 7. Obsidian Compatibility Matrix

| Feature | vault-user | vault-shared | vault-global | Unified View |
|---------|-----------|--------------|--------------|--------------|
| **Wikilinks** | ✅ Full | ✅ Full | ✅ Read-only | ✅ Works |
| **Tags** | ✅ Full | ✅ Full | ✅ Read-only | ✅ Merged |
| **Backlinks** | ✅ Local | ✅ Local | ✅ Local | ✅ Across layers |
| **Graph View** | ✅ User only | ✅ Shared only | ✅ Global only | ⚠️ Needs plugin |
| **Frontmatter** | ✅ Full | ✅ Conditional | ✅ Read-only | ✅ Merged |
| **Templates** | ✅ User | ❌ | ❌ | ✅ User layer |
| **Plugins** | ✅ User config | ❌ | ❌ | ✅ User layer |

### 7.1 Obsidian Plugin for Layered Vault

```typescript
// obsidian-udos-plugin/main.ts
export default class UDOSLayeredVault extends Plugin {
  async onload() {
    // Register virtual file system
    this.registerVirtualFilesystem();
    
    // Merge frontmatter from all layers
    this.registerMarkdownPostProcessor();
    
    // Enable cross-layer backlinks
    this.registerBacklinkResolver();
    
    // Add uDOS protocol handler
    this.registerProtocolHandler();
  }
  
  async registerVirtualFilesystem() {
    // Interpolate ~/Vault/ as union of all layers
    this.app.vault.adapter = new LayeredAdapter();
  }
}
```

---

## 8. Publishing Flow

```yaml
publishing_flows:
  # Instant web publishing (vault-shared/@public)
  instant:
    source: "vault-shared/@public/*"
    trigger: "git push"
    destination: "https://{user}.udos.dev/"
    rules: "public, no auth"
    
  # Conditional sharing (vault-shared/@user or @team)
  conditional:
    source: "vault-shared/@user/{target}/"
    trigger: "api call"
    rules:
      - "single-use: token expires after read"
      - "time-bound: expires after date"
      - "user-limited: specific GitHub users"
      - "group-limited: specific SIG members"
      
  # Global contribution (vault-user -> vault-global)
  global:
    source: "vault-user/orbs/*"
    trigger: "submit via wizard"
    approval: "uDosGo team"
    destination: "vault-global/categories/"
    after_approval: "git push to org repo"
```

---

## 9. Acceptance Criteria

- [ ] `~/Code/vault-user/`, `~/Code/vault-shared/`, `~/Code/vault-global/` all exist as git repos
- [ ] Union filesystem mounts all three at `~/Vault/`
- [ ] Obsidian opens `~/Vault/` and sees merged content
- [ ] Edits to `~/Vault/` write to correct layer (user wins)
- [ ] Global knowledge categories are browseable as orbs
- [ ] MCP operations work across all layers
- [ ] GitHub sync works (user to fredporter, global from uDosGo)
- [ ] GitHubNext provides semantic search and LLM context
- [ ] Publishing flows work for @public, conditional, and global
- [ ] Orbs can be linked across layers using wikilinks

---

## 10. References

- **GitHubNext**: https://githubnext.com
- **UnionFS**: https://github.com/rpodgorny/unionfs
- **Obsidian URI**: https://help.obsidian.md/Extending+Obsidian/Obsidian+URI
- **Previous Spec**: uDOS Vault Specification v2.0
