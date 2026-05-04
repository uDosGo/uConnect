# uDosGo Organization Structure Analysis

## Current Remote Repositories

### Core Repositories (Structured)
1. **SonicScrewdriver** - API Central Hub ✅
2. **Connect** - Main Framework ✅  
3. **Home** - Home Management ✅

### Additional Repositories (Need Integration)
4. **demo** - Empty repository
5. **world** - Basic structure (package.json, README.md)
6. **groovebox** - Music production system (AGENTS.md, app/, config/)
7. **framework** - Framework templates (bin/, dev/, DEV_HUB.md)

## Structure Analysis

### demo/ (Empty)
- Purpose: Unknown - appears to be placeholder
- Status: Empty repository
- Action: Needs framework integration or removal

### world/ (Basic)
```
world/
├── .gitignore
├── package.json
└── README.md
```
- Purpose: Likely 3D world environment
- Status: Basic Node.js project setup
- Missing: Docs/, dev/, dev/Framework/ structure
- Action: Apply framework standardization

### groovebox/ (Developed)
```
groovebox/
├── AGENTS.md          # Agent documentation
├── app/               # Application code
├── config/            # Configuration
├── containers/       # Container setup
├── CHANGELOG.md      # Version history
└── CONTRIBUTING.md    # Contribution guide
```
- Purpose: Music production system
- Status: Actively developed
- Missing: Standardized framework structure
- Action: Integrate with Connect framework

### framework/ (Templates)
```
framework/
├── bin/               # CLI tools
├── dev/               # Development
├── DEV_HUB.md         # Dev hub docs
├── ecosystem-dev-record.md
└── IMPLEMENTATION_PLAN.md
```
- Purpose: Framework templates and standards
- Status: Contains core framework definitions
- Action: Merge with Connect/dev/Framework/

## Framework Integration Plan

### 1. Standardize All Repositories
Apply consistent structure to all repos:
```
repo/
├── Docs/              # Documentation
├── dev/               # Development
│   └── Framework/    # Framework integration
├── src/ or app/       # Source code
├── config/            # Configuration
└── README.md          # Project overview
```

### 2. Repository-Specific Actions

**demo:**
- Option A: Remove (if not needed)
- Option B: Apply framework + create demo app

**world:**
```bash
cd ~/uDosGo/world
mkdir -p Docs dev/Framework
cp ../Connect/dev/Framework/udevframework/README.md dev/Framework/
udev init world --layers base-node
```

**groovebox:**
```bash
cd ~/uDosGo/groovebox
mkdir -p Docs dev/Framework
cp ../Connect/dev/Framework/udevframework/README.md dev/Framework/
udev layer add ok-base --flavour deepseek
```

**framework:**
```bash
# Merge with Connect framework
cp -r ~/uDosGo/framework/* ~/uDosGo/Connect/dev/Framework/
# Keep as reference or archive
```

### 3. Cross-Repository Development Flow

```bash
# Initialize new project with framework
udev init new-project --layers base-node,ok-base

# Add repository to ecosystem
udev repo add --name world --path ~/uDosGo/world

# Cross-repo development
udev dev --link Connect --link world --link groovebox

# Framework updates
udev update --all-repos
```

### 4. SonicScrewdriver Integration

```bash
# Manage secrets across all repos
sonic secret add groovebox_api_key --value "xyz123"
sonic secret grant groovebox_api_key --node groovebox
sonic secret grant groovebox_api_key --node Connect

# Node management
sonic node register --master Connect --name world
sonic node register --master Connect --name groovebox

# API proxy setup
sonic proxy setup --provider groovebox --endpoint /api/music
```

### 5. Framework Instructions

**Standardized Commands:**
```bash
# Initialize repository
udev init <repo-name> --template <template-name>

# Add framework layer
udev layer add <layer-name> --flavour <flavour>

# Run development server
udev dev --repo <repo-name>

# Build for production
udev build --repo <repo-name> --target <platform>

# Deploy to ecosystem
udev deploy --repo <repo-name> --env <environment>
```

## Recommended Actions

1. **Apply Framework to world/ and groovebox/**
2. **Merge framework/ into Connect/dev/Framework/**
3. **Set up cross-repository development links**
4. **Configure SonicScrewdriver for all repos**
5. **Document the unified workflow**

## Current Gaps

1. **demo/** - Needs purpose definition or removal
2. **world/** - Missing framework integration
3. **groovebox/** - Needs standardized structure
4. **framework/** - Duplicate of Connect framework
5. **Cross-repo config** - No unified configuration system

## Next Steps

```bash
# 1. Standardize world/
cd ~/uDosGo/world
udev init . --layers base-node

# 2. Standardize groovebox/
cd ~/uDosGo/groovebox  
udev layer add ok-base

# 3. Merge frameworks
cp -r ~/uDosGo/framework/* ~/uDosGo/Connect/dev/Framework/

# 4. Set up cross-repo links
udev repo link --all

# 5. Configure secrets
sonic secret add ecosystem_shared --value "shared-secret"
sonic secret grant ecosystem_shared --node Connect --node world --node groovebox
```

