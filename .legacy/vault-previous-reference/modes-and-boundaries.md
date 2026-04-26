# Modes And Boundaries

## Purpose

Explain the high-level mode and boundary model for the public family.

## Core Rule

The family should keep user, operator, and contributor surfaces understandable.

Different surfaces can work together, but they should not blur into one hidden
mode.

## Public-Facing Modes

### Reader or learner mode

Use for:

- onboarding
- architecture reading
- examples
- course material

### Operator mode

Use for:

- running current products
- using local or networked service surfaces
- reviewing outputs and sync state

### Builder mode

Use for:

- working with examples, templates, contracts, and scaffolds
- extending repo-owned surfaces without changing family-wide semantics casually

## Boundary Model

- `uDOS-core` defines canonical semantics
- `uDOS-wizard` provides network/provider-facing surfaces
- `uHOME-server` provides local runtime surfaces
- `uDOS-empire` provides online sync and webhook/API surfaces
- private client apps provide native platform UX where public repos should not

## Shared Module Rule

A shared module can serve more than one surface.

That does not erase ownership.

Example:

- one render or IO module may support both web publishing and Beacon Activate local library output
- the surrounding runtime contract still belongs to the repo that owns that surface
