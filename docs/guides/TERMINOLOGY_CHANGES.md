# Terminology Changes Summary

## 📋 Changes Made

### 1. Mission → Milestone → Move → Step → Point
**Old:** Used "days" and "rounds" for time estimation
**New:** Outcome-based units with no fixed time durations

### 2. Workspace & Binder as Folder Aliases
**Old:** Physical folders only
**New:** Logical organization with symlinks

### 3. Vault vs Code-Vault Distinction
**Old:** Combined storage
**New:** Clear separation with different sync strategies

---

## 🎯 Benefits

1. **Clarity** - Outcome-based units are easier to understand
2. **Flexibility** - No artificial time pressure
3. **Consistency** - Standard structure across projects
4. **Scalability** - Works for small tasks and large missions

---

## Migration Guide

### For Existing Projects
1. Update `DEVELOPMENT_ROADMAP_ROUNDS.md` to use new terminology
2. Rename `days` → `rounds` in documentation
3. Update CLI help text to reflect new units
4. Add symlinks for Workspace/Binder aliases

### For New Projects
1. Start with Mission definition
2. Break into Milestones
3. Decompose into Moves
4. Execute as Steps and Points

---

## Example

```bash
# Old: "This will take 3-5 days"
# New: "This milestone has 3 moves"

# Old: "Work in ~/vault/workspace/"
# New: "Work in @workspace/ (symlinked to ~/vault/workspace/)"

# Old: "Code and docs in same vault"
# New: "Code in code-vault/, docs in vault/"
```

---

## Impact

- **Developer Experience:** More intuitive, less stress
- **User Experience:** Clearer project structure
- **Maintenance:** Easier to update and extend

---

## Commands

```bash
# Create a new mission
mission start "Project Name"

# Add a milestone
milestone add "Key Feature"

# Start working
move start "Implementation"
  step start "First task"
    point add "Update config"
    point done 1
  step end
move end

# Check progress
mission status
```

---

**Status:** Terminology changes applied ✅
**Next:** Continue with Cycle 1, Round 2 implementation