# recipe-system/

---

## README.md

### Recipe System

A component-based recipe and meal preparation system using markdown as the source of truth for both publishing and kitchen operations.

Designed for:
- home cooking (2–4 adults)
- structured meal prep
- future small-scale food production

---

## binder.md

### Topic
A component-based recipe and meal preparation system, using markdown as the source of truth for both publishing and kitchen operations, designed for home use and scalable into small food production.

### Goals

#### Outcome Goals
- produce consistent, high-quality meals for 2–4 adults  
- reduce daily cooking effort through structured prep  
- support meal variety without increasing complexity  
- enable transition from home cooking to small-scale production  
- prioritise wholefood, fresh, and locally sourced ingredients  
- minimise food waste through full-ingredient utilisation  
- support nutritionally balanced meals across weekly cycles  

#### System Goals
- standardise portioning, prep, storage, and reuse  
- structure recipes as modular, component-based units  
- ensure recipes perform reliably across cooking, storage, and reheating  
- support both flexible (home) and controlled (bulk) workflows  
- incorporate waste-reduction practices into prep and storage logic  

#### Technical Goals
- maintain markdown as the single source of truth  
- enable structured publishing (SEO + recipe schema)  
- keep the system portable across static site tools  

### Core Concerns

#### System Risks
- over-complication of tools or workflow  
- inconsistent recipe structure  
- portion drift  
- weak linkage between recipes and guides  
- loss of portability  

#### Operational Constraints
- limited daily time  
- cognitive load  
- planning discipline  
- storage limits  

#### Quality Risks
- storage/reheating degradation  
- inconsistent results  
- food waste  
- freezer over-reliance  
- poor repeatability  
- nutritional inconsistency  

### Research Areas
- portion modelling  
- component design  
- nutrition balance  
- waste utilisation  
- storage performance  
- workflow optimisation  
- markdown + schema system  

### Observations
- 250 g component unit works well  
- meals fall within 500–700 g  
- dual-mode system is effective  
- markdown ensures portability  
- recipes + guides separation improves clarity  
- inventory + consumables are required system layers  
- sustainability constraints affect material choice  

### Trade-offs
- structure vs flexibility  
- component model vs simplicity  
- quality vs efficiency  
- fresh vs frozen  
- sustainability vs convenience  
- consumables vs waste  
- affiliate vs trust (trust-first rule)  
- inventory vs usability  
- portability vs automation  
- home vs bulk  

### Local Application
- 2 bulk days + light daily cooking  
- Tue/Thu supply rhythm  
- structured weekly template  
- freezer = buffer + backup system  
- labelled portioned storage  
- component-based assembly  

### Next Steps
(see next-steps.md)

---

## workflow.json

{
  "portion_model": {
    "micro_g": "100-150",
    "component_g": 250,
    "meal_g": "500-700"
  },
  "flow": [
    "delivery",
    "raw prep",
    "component prep",
    "meal assembly",
    "storage",
    "labelling",
    "defrosting",
    "reheating",
    "serving"
  ],
  "inventory_levels": [
    "raw",
    "prepped",
    "component",
    "meal"
  ]
}

---

## next-steps.md

### Phase 1
- validate core recipes  
- test storage + reheating  
- validate freezer system  

### Phase 2
- define recipe contract  
- classify recipes  
- define inventory model  

### Phase 3
- choose static site  
- build template  
- define image workflow  

### Phase 4
- link recipes to inventory  
- scaffold affiliate layer  

### Phase 5
- define containers  
- implement labelling  

### Phase 6
- implement lightweight nutrition tracking  

---

## run-local.md

### Weekly System

- Tue: poultry + prep  
- Thu: red meat + prep  
- Fri: fish fresh  

### Daily
- assemble meals from components  
- light cooking only  

### Freezer
- portioned storage only  
- active + reserve system  
- labelled + rotated  

---

## optional.md

### Future Layers

- affiliate integration (Amazon)  
- advanced nutrition tracking  
- inventory automation  
- supplier sourcing system  

---

