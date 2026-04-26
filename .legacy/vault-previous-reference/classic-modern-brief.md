# Classic Modern — Design System + UX Philosophy

## Brief metadata

- title: Classic Modern Design System + ThinUI Surface + Sonic TUI Alignment
- date: 2026-04-02
- author: Fred Porter / uDOS
- scope: family
- target repo(s): `uDOS-themes`, `uDOS-thinui`, `uDOS-host`, `uDOS-shell`, `sonic-screwdriver`
- related lane: post-08 / `v2.3` gate item

## Problem statement

Modern operating environments have drifted toward visual layering, blur, transparency, oversized spacing, and fragmented workflows across too many tools. This creates visual noise, cognitive load, and a poor fit for the uDOS philosophy of markdown-first, binder-driven work.

At the same time, utility repos can drift into browser-first UI stacks that are inappropriate for their purpose. Sonic Screwdriver is the immediate example: as a fixer/installer/setup utility, it should not surprise users with a browser GUI.

## In-family expected outcome

Introduce **Classic Modern** as a shared design system and UX philosophy spanning:

- Ubuntu host posture
- ThinUI primary fullscreen surface
- uDOS Shell visual language
- utility presentation expectations

The result should be:

- modern underneath
- calm and mono-first at first glance
- distraction-free by default
- compatible with normal OS windows when needed
- not locked to browser-first interaction

## Core principles

- Calm over flashy
- Clarity over novelty
- Fewer surfaces over more containers
- Function-first UI
- Mono-first colour system
- TUI-first for utilities
- ThinUI-first for focused work

## Shared operating model

### Host layer

Ubuntu/GNOME remains the host runtime and system environment.

### Primary surface

ThinUI provides the preferred fullscreen working mode.

### Fallback surface

Native OS windows and apps remain available. Users are not locked in.

### Utility layer

Utilities such as Sonic Screwdriver remain terminal-only and SSH-safe.

## Constraints and boundaries

### Ownership boundaries

- Core owns workflow and binder contracts.
- Ubuntu owns host runtime posture.
- Themes and ThinUI own design-system and primary-surface presentation.
- Shell owns TUI interaction patterns.
- Sonic remains a utility lane, not a browser product surface.

### Runtime/storage constraints

- Runtime state lives under `~/.udos/`.
- No repo-state drift.
- No ad hoc state ownership by docs or UI repos.

### Design boundaries

- no blur
- no transparency
- no glass effects
- no decorative window stacks as default UX
- no browser GUI for utility-first tools

## Proposed change set

### `uDOS-themes`

Own the Classic Modern design system:

- token definitions
- color, spacing, border, type rules
- checkerboard/background rules
- font guidance

### `uDOS-thinui`

Own the fullscreen distraction-free primary surface:

- single active work surface
- markdown-first document display/editing
- minimal top controls
- expandable panels instead of window stacks

### `uDOS-host`

Own the host alignment:

- de-modernised GNOME posture
- tweak/theme profile
- launch path into ThinUI
- fallback to native GNOME

### `uDOS-shell`

Own the matching TUI expression:

- mono-first color mapping
- compact layouts
- readable defaults
- interactive but restrained output

### `sonic-screwdriver`

Own TUI-only install/repair/doctor utilities:

- no browser launch for core jobs
- clear, guided terminal flows
- possible reuse as a base pattern for future uDOS TUI utility work

## Non-goals

- full GNOME replacement
- hard lock-in to a custom surface
- browser GUI as default for utilities
- retro novelty for its own sake
- pixel-perfect museum recreation of classic Mac OS

## Acceptance checklist

- [ ] terminology matches family guardrails
- [ ] no contradictory ownership claims
- [ ] no out-of-family default stack drift
- [ ] ThinUI is the preferred focused mode
- [ ] Sonic is clearly TUI-only
- [ ] host/runtime posture remains Ubuntu-owned
