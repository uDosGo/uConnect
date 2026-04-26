uDOS-sonic-screwdriver v2 Upgrade Brief

Boot, Install & Deployment System for uDOS Environments

⸻

Purpose

sonic-screwdriver (ss) is the canonical deployment engine for uDOS.

It is responsible for:
	•	preparing bootable media (sonic-stick)
	•	delivering uDOS-compatible OS images (starting with uDOS-host)
	•	enabling live, install, recovery, and multi-image workflows
	•	injecting configuration and identity into installs
	•	providing a uDOS-native boot and install experience

This upgrade moves ss from:

“USB flasher tool”

to:

portable OS orchestration + deployment runtime

⸻

Core Evolution (v1 → v2)

v1
	•	simple Linux-based USB flasher
	•	single-image install flow
	•	minimal UI

⸻

v2
	•	multi-image boot system (Ventoy-class)
	•	uDOS-styled boot UI
	•	config injection + identity layer
	•	live OS + installer + recovery modes
	•	modular OS support (starting with uDOS-host)

⸻

Core Principles

1. USB as a System, Not Just Installer

The sonic-stick is:
	•	a bootable OS host
	•	a deployment tool
	•	a portable uDOS environment

⸻

2. Stateless Tool, Stateful Media
	•	sonic-screwdriver = stateless CLI/TUI tool
	•	sonic-stick = persistent, updatable system

⸻

3. uDOS-First Experience

From boot menu → install → first login:
	•	consistent uDOS identity
	•	themed UI (even in TUI)

⸻

4. Modular OS Delivery
	•	uDOS-host first-class
	•	future:
	•	alt Linux bases
	•	recovery tools
	•	diagnostics environments

⸻

High-Level Architecture

sonic-screwdriver
├── cli/
├── tui/
├── core/
│   ├── disk/
│   ├── partition/
│   ├── bootloader/
│   └── iso/
│
├── sonic-stick/
│   ├── layout/
│   ├── boot/
│   ├── images/
│   ├── config/
│   └── persistence/
│
├── os-profiles/
│   └── udos-ubuntu/
│
├── inject/
│   ├── user/
│   ├── network/
│   └── udos/
│
└── docs/


⸻

Sonic-Stick Specification

Partition Layout (GPT)

USB Device
├── EFI (FAT32, ~512MB)
│   └── bootloaders
│
├── DATA (exFAT)
│   ├── /images
│   ├── /config
│   └── /udos
│
└── PERSIST (optional ext4)
    └── live OS persistence


⸻

Capabilities
	•	boots on:
	•	UEFI (primary)
	•	Legacy BIOS (optional support)
	•	stores multiple OS images
	•	supports persistence
	•	supports config injection
	•	supports updates without reformat

⸻

Boot System (Ventoy-Class)

Boot Flow
	1.	BIOS/UEFI loads EFI partition
	2.	ss bootloader launches
	3.	uDOS Sonic Menu appears
	4.	User selects:
	•	OS image
	•	mode (live/install/recovery)

⸻

Sonic Menu (TUI UI)

Design:
	•	uDOS terminal aesthetic
	•	keyboard + gamepad support
	•	fast navigation

⸻

Menu Options Example

uDOS Sonic Boot

> uDOS Ubuntu (Live)
> uDOS Ubuntu (Install)
> uDOS Ubuntu (Recovery)
> Tools
    - Disk Utility
    - Network Debug
    - Memory Test


⸻

OS Profile System

Concept

Each OS has a profile module:

os-profiles/
└── udos-ubuntu/
    ├── manifest.json
    ├── install.sh
    ├── live.sh
    └── inject/


⸻

Responsibilities

Defines:
	•	how to boot ISO
	•	how to install OS
	•	what config can be injected
	•	post-install hooks

⸻

uDOS-Ubuntu Integration

Required Support

ss must:
	•	download latest build
	•	verify checksum
	•	place into /images
	•	register in boot menu

⸻

Install Flow
	1.	user selects “Install”
	2.	ss:
	•	launches installer
	•	injects config (optional)
	3.	post-install:
	•	applies uDOS bootstrap hooks
	•	enables first-run setup

⸻

Config Injection System

Purpose

Allow preconfigured installs without manual setup.

⸻

Injection Targets

1. User Identity
	•	username
	•	hostname
	•	SSH keys (optional)

⸻

2. Network
	•	WiFi credentials
	•	local network mode (uHOME-ready)

⸻

3. uDOS Config
	•	vault path
	•	wizard endpoint
	•	default modules

⸻

Injection Method
	•	cloud-init style OR
	•	preseed/autoinstall (Ubuntu-native)

⸻

Live Environment

Capabilities
	•	run full OS from USB
	•	optional persistence layer
	•	test hardware compatibility
	•	portable uDOS environment

⸻

Persistence (Optional)
	•	ext4 partition
	•	stores:
	•	user files
	•	settings
	•	uDOS data

⸻

Recovery Mode

Tools
	•	disk repair
	•	reinstall OS
	•	backup/export vault
	•	network diagnostics

⸻

CLI Interface (sonic-screwdriver)

Example Commands

ss init /dev/sdX
ss add udos-ubuntu
ss update
ss inject config.json
ss list


⸻

TUI Interface

Modes
	•	guided setup (wizard-style)
	•	advanced mode (power users)

⸻

Key Features
	•	disk selection UI
	•	partition preview
	•	OS selection
	•	config injection UI

⸻

macOS Considerations

Limitation

macOS:
	•	struggles with multi-partition USB creation

⸻

Strategy

Phase 1 (Recommended)
	•	Linux-only full support

⸻

Phase 2
macOS support for:
	•	updating images
	•	editing config

⸻

Phase 3 (Optional Advanced)
	•	scripted partitioning via diskutil
	•	limited but possible full support

⸻

Visual Identity Layer

Bootloader Theme
	•	uDOS minimal theme

⸻

Sonic Menu
	•	terminal-style UI
	•	consistent with uDOS shell

⸻

Messaging Tone

Replace generic text like:
	•	“Loading kernel…”

With:
	•	“Mounting system layer…”
	•	“Initialising binder runtime…”

⸻

Security Model
	•	checksum verification for all images
	•	optional signed builds
	•	secure config injection (no plaintext secrets unless user opts in)

⸻

Non-Goals
	•	Not a full OS
	•	Not a GUI-heavy tool
	•	Not tied to Ubuntu only
	•	Not a replacement for uDOS-core

⸻

Future Extensions
	•	multi-OS support (dual environments)
	•	network boot (PXE-style uDOS deploy)
	•	encrypted sonic-stick
	•	remote fleet provisioning (uDOS-empire)
	•	hardware auto-profiling + optimisation

⸻

Summary

sonic-screwdriver v2 becomes:

a portable, uDOS-native OS deployment system
capable of booting, running, installing, and repairing entire environments

It transforms:
	•	USB → platform
	•	installer → orchestrator
	•	boot menu → uDOS entry point

⸻

Perfect — this locks the direction in cleanly.

Here’s the uDOS-sonic-screwdriver v2 addendum incorporating:
	•	sonic-ventoy fork (official name)
	•	standardised partition layouts
	•	128GB default + 64GB variant
	•	aligned to your v2 architecture

⸻

uDOS-sonic-screwdriver v2

Addendum: sonic-ventoy Boot Platform + Standard Media Layout

⸻

Purpose of Addendum

This document defines:
	•	the official boot substrate for sonic-screwdriver
	•	the standard sonic-stick partition layouts
	•	storage allocation for 128GB (primary) and 64GB (compact) devices
	•	integration boundaries between:
	•	uDOS-sonic-screwdriver
	•	sonic-ventoy
	•	uDOS-host

⸻

Boot Platform Decision

Official Boot Layer

sonic-ventoy (fork of Ventoy)

⸻

Role of sonic-ventoy

sonic-ventoy is:
	•	the bootloader + multi-image runtime
	•	the menu system (GRUB-based)
	•	the USB media controller layer

It is responsible for:
	•	boot compatibility (UEFI + optional BIOS)
	•	ISO/image discovery
	•	persistence handling (file-based)
	•	plugin system (themes, menus, injection)

⸻

uDOS Ownership Layer

sonic-ventoy fork adds:
	•	uDOS themes (modern + retro)
	•	uDOS menu structure (not raw ISO list)
	•	uDOS menu language + tone
	•	profile-aware boot entries
	•	sonic-screwdriver integration hooks

⸻

Non-Goals (unchanged)
	•	do not rewrite Ventoy core (v2)
	•	do not replace GRUB
	•	do not fork deeper than necessary

⸻

Sonic-Stick Standard

The sonic-stick is now defined as a:

persistent, multi-OS, uDOS deployment device

⸻

Partition Strategy (Standardised)

Table Type
	•	GPT (GUID Partition Table) — required

⸻

128GB Sonic-Stick (Primary Standard)

Layout

USB Device (128GB)

Partition 1 — EFI
- Size: 512 MB
- Format: FAT32
- Label: UDOS-EFI
- Purpose:
  - UEFI boot
  - sonic-ventoy bootloader
  - boot themes (minimal assets)

---

Partition 2 — SONIC-DATA
- Size: ~110 GB
- Format: exFAT
- Label: SONIC
- Purpose:
  - OS images
  - profiles
  - configs
  - themes
  - tools
  - recovery systems

---

Partition 3 — SONIC-PERSIST (optional but recommended)
- Size: ~16 GB
- Format: ext4
- Label: PERSIST
- Purpose:
  - live OS persistence
  - cached packages
  - portable uDOS runtime data


⸻

Rationale
	•	512MB EFI
	•	safe headroom for themes + future loaders
	•	exFAT main partition
	•	cross-platform (Linux / macOS / Windows)
	•	supports large ISO files (>4GB)
	•	16GB persistence
	•	enough for:
	•	Ubuntu live session
	•	package installs
	•	light user data

⸻

64GB Sonic-Stick (Compact Option)

Layout

USB Device (64GB)

Partition 1 — EFI
- Size: 512 MB
- Format: FAT32
- Label: UDOS-EFI

---

Partition 2 — SONIC-DATA
- Size: ~54 GB
- Format: exFAT
- Label: SONIC

---

Partition 3 — SONIC-PERSIST (optional)
- Size: ~8 GB
- Format: ext4
- Label: PERSIST


⸻

Rationale
	•	smaller persistence footprint
	•	still supports:
	•	2–4 OS images comfortably
	•	full uDOS-host + recovery tools

⸻

Alternative Mode (Simplified / Default)

For maximum compatibility and ease-of-use:

v2 default = 2 partitions only

EFI (FAT32)
SONIC-DATA (exFAT)

Persistence handled via:
	•	Ventoy persistence files
	•	or later user opt-in partition expansion

⸻

Filesystem Roles

FAT32 (EFI)
	•	required by UEFI firmware
	•	universally supported

⸻

exFAT (SONIC-DATA)
	•	large file support
	•	readable/writable across:
	•	Linux
	•	macOS
	•	Windows

⸻

ext4 (PERSIST)
	•	Linux-native performance
	•	journaling
	•	suitable for live OS state

⸻

On-Disk Structure (SONIC Partition)

/boot
/config
  /global
  /devices
  /profiles

/images
  /udos-ubuntu
  /recovery
  /extras

/profiles
  /udos-ubuntu

/recovery
/tools

/themes
  /udos-modern
  /udos-retro

/udos
  /bootstrap
  /assets
  /manifests

ventoy.json


⸻

sonic-ventoy Responsibilities

Boot Layer
	•	GRUB-based menu (via Ventoy)
	•	uDOS theme loading
	•	menu rendering
	•	image discovery

⸻

Plugin Layer

Must support:
	•	theme plugin → uDOS visual identity
	•	menu extension → curated entries
	•	menu class → icon + type grouping
	•	injection plugin → config delivery
	•	persistence plugin → live OS storage

⸻

Menu Behaviour (uDOS Override)

Replace:

raw ISO listing

With:

uDOS Sonic Boot

> uDOS Ubuntu
    - Live
    - Install
    - Recovery

> Tools
    - Disk Utility
    - Network Tools
    - Memory Test

> System
    - Boot Local Disk
    - Advanced Images


⸻

sonic-screwdriver Responsibilities

ss init (Updated)
	•	partition USB (GPT)
	•	create:
	•	EFI (FAT32)
	•	SONIC (exFAT)
	•	optional PERSIST (ext4)
	•	install sonic-ventoy fork
	•	apply default uDOS theme
	•	scaffold directory structure
	•	generate base ventoy.json

⸻

ss add (Updated)

Example:

ss add udos-ubuntu

Performs:
	•	download image
	•	verify checksum
	•	place in /images/udos-ubuntu
	•	install profile into /profiles
	•	register menu metadata
	•	prepare injection configs

⸻

ss update
	•	update sonic-ventoy core
	•	preserve:
	•	user images
	•	configs
	•	persistence

⸻

ss theme

ss theme retro
ss theme modern

Switches active boot theme.

⸻

macOS Support (Clarified)

Supported
	•	read/write SONIC (exFAT)
	•	update images
	•	edit configs

⸻

Not Supported (v2)
	•	full device partitioning
	•	initial sonic-stick creation

⸻

Workflow
	1.	create stick via Linux
	2.	maintain via macOS if needed

⸻

Storage Planning Guidance

128GB Stick Typical Usage
	•	6–10 OS images
	•	full uDOS-host
	•	recovery tools
	•	persistence enabled

⸻

64GB Stick Typical Usage
	•	2–5 OS images
	•	uDOS-host primary
	•	light recovery set

⸻

Naming Standard

Component	Name
Boot fork	sonic-ventoy
Installer tool	uDOS-sonic-screwdriver
USB device	sonic-stick


⸻

Summary

This addendum defines a real, standardised physical deployment model for uDOS:
	•	Ventoy-based boot system → forked as sonic-ventoy
	•	GPT partitioned sonic-stick → consistent across installs
	•	exFAT-based data layer → cross-platform usability
	•	optional persistence → Linux-native runtime state
	•	sonic-screwdriver → orchestrates everything

⸻

Final Position

uDOS now owns the full path from:

USB → Boot → OS → Bootstrap → Runtime

without needing to own:
	•	low-level bootloader complexity
	•	ISO compatibility matrix
	•	firmware edge cases

⸻

Addendum: sonic-ventoy Boot Platform + Standard Media Layout

⸻

Purpose of Addendum

This document defines:
	•	the official boot substrate for sonic-screwdriver
	•	the standard sonic-stick partition layouts
	•	storage allocation for 128GB (primary) and 64GB (compact) devices
	•	integration boundaries between:
	•	uDOS-sonic-screwdriver
	•	sonic-ventoy
	•	uDOS-host

⸻

Boot Platform Decision

Official Boot Layer

sonic-ventoy (fork of Ventoy)

⸻

Role of sonic-ventoy

sonic-ventoy is:
	•	the bootloader + multi-image runtime
	•	the menu system (GRUB-based)
	•	the USB media controller layer

It is responsible for:
	•	boot compatibility (UEFI + optional BIOS)
	•	ISO/image discovery
	•	persistence handling (file-based)
	•	plugin system (themes, menus, injection)

⸻

uDOS Ownership Layer

sonic-ventoy fork adds:
	•	uDOS themes (modern + retro)
	•	uDOS menu structure (not raw ISO list)
	•	uDOS menu language + tone
	•	profile-aware boot entries
	•	sonic-screwdriver integration hooks

⸻

Non-Goals (unchanged)
	•	do not rewrite Ventoy core (v2)
	•	do not replace GRUB
	•	do not fork deeper than necessary

⸻

Sonic-Stick Standard

The sonic-stick is now defined as a:

persistent, multi-OS, uDOS deployment device

⸻

Partition Strategy (Standardised)

Table Type
	•	GPT (GUID Partition Table) — required

⸻

128GB Sonic-Stick (Primary Standard)

Layout

USB Device (128GB)

Partition 1 — EFI
- Size: 512 MB
- Format: FAT32
- Label: UDOS-EFI
- Purpose:
  - UEFI boot
  - sonic-ventoy bootloader
  - boot themes (minimal assets)

---

Partition 2 — SONIC-DATA
- Size: ~110 GB
- Format: exFAT
- Label: SONIC
- Purpose:
  - OS images
  - profiles
  - configs
  - themes
  - tools
  - recovery systems

---

Partition 3 — SONIC-PERSIST (optional but recommended)
- Size: ~16 GB
- Format: ext4
- Label: PERSIST
- Purpose:
  - live OS persistence
  - cached packages
  - portable uDOS runtime data


⸻

Rationale
	•	512MB EFI
	•	safe headroom for themes + future loaders
	•	exFAT main partition
	•	cross-platform (Linux / macOS / Windows)
	•	supports large ISO files (>4GB)
	•	16GB persistence
	•	enough for:
	•	Ubuntu live session
	•	package installs
	•	light user data

⸻

64GB Sonic-Stick (Compact Option)

Layout

USB Device (64GB)

Partition 1 — EFI
- Size: 512 MB
- Format: FAT32
- Label: UDOS-EFI

---

Partition 2 — SONIC-DATA
- Size: ~54 GB
- Format: exFAT
- Label: SONIC

---

Partition 3 — SONIC-PERSIST (optional)
- Size: ~8 GB
- Format: ext4
- Label: PERSIST


⸻

Rationale
	•	smaller persistence footprint
	•	still supports:
	•	2–4 OS images comfortably
	•	full uDOS-host + recovery tools

⸻

Alternative Mode (Simplified / Default)

For maximum compatibility and ease-of-use:

v2 default = 2 partitions only

EFI (FAT32)
SONIC-DATA (exFAT)

Persistence handled via:
	•	Ventoy persistence files
	•	or later user opt-in partition expansion

⸻

Filesystem Roles

FAT32 (EFI)
	•	required by UEFI firmware
	•	universally supported

⸻

exFAT (SONIC-DATA)
	•	large file support
	•	readable/writable across:
	•	Linux
	•	macOS
	•	Windows

⸻

ext4 (PERSIST)
	•	Linux-native performance
	•	journaling
	•	suitable for live OS state

⸻

On-Disk Structure (SONIC Partition)

/boot
/config
  /global
  /devices
  /profiles

/images
  /udos-ubuntu
  /recovery
  /extras

/profiles
  /udos-ubuntu

/recovery
/tools

/themes
  /udos-modern
  /udos-retro

/udos
  /bootstrap
  /assets
  /manifests

ventoy.json


⸻

sonic-ventoy Responsibilities

Boot Layer
	•	GRUB-based menu (via Ventoy)
	•	uDOS theme loading
	•	menu rendering
	•	image discovery

⸻

Plugin Layer

Must support:
	•	theme plugin → uDOS visual identity
	•	menu extension → curated entries
	•	menu class → icon + type grouping
	•	injection plugin → config delivery
	•	persistence plugin → live OS storage

⸻

Menu Behaviour (uDOS Override)

Replace:

raw ISO listing

With:

uDOS Sonic Boot

> uDOS Ubuntu
    - Live
    - Install
    - Recovery

> Tools
    - Disk Utility
    - Network Tools
    - Memory Test

> System
    - Boot Local Disk
    - Advanced Images


⸻

sonic-screwdriver Responsibilities

ss init (Updated)
	•	partition USB (GPT)
	•	create:
	•	EFI (FAT32)
	•	SONIC (exFAT)
	•	optional PERSIST (ext4)
	•	install sonic-ventoy fork
	•	apply default uDOS theme
	•	scaffold directory structure
	•	generate base ventoy.json

⸻

ss add (Updated)

Example:

ss add udos-ubuntu

Performs:
	•	download image
	•	verify checksum
	•	place in /images/udos-ubuntu
	•	install profile into /profiles
	•	register menu metadata
	•	prepare injection configs

⸻

ss update
	•	update sonic-ventoy core
	•	preserve:
	•	user images
	•	configs
	•	persistence

⸻

ss theme

ss theme retro
ss theme modern

Switches active boot theme.

⸻

macOS Support (Clarified)

Supported
	•	read/write SONIC (exFAT)
	•	update images
	•	edit configs

⸻

Not Supported (v2)
	•	full device partitioning
	•	initial sonic-stick creation

⸻

Workflow
	1.	create stick via Linux
	2.	maintain via macOS if needed

⸻

Storage Planning Guidance

128GB Stick Typical Usage
	•	6–10 OS images
	•	full uDOS-host
	•	recovery tools
	•	persistence enabled

⸻

64GB Stick Typical Usage
	•	2–5 OS images
	•	uDOS-host primary
	•	light recovery set

⸻

Naming Standard

Component	Name
Boot fork	sonic-ventoy
Installer tool	uDOS-sonic-screwdriver
USB device	sonic-stick


⸻

Summary

This addendum defines a real, standardised physical deployment model for uDOS:
	•	Ventoy-based boot system → forked as sonic-ventoy
	•	GPT partitioned sonic-stick → consistent across installs
	•	exFAT-based data layer → cross-platform usability
	•	optional persistence → Linux-native runtime state
	•	sonic-screwdriver → orchestrates everything

⸻

Final Position

uDOS now owns the full path from:

USB → Boot → OS → Bootstrap → Runtime

without needing to own:
	•	low-level bootloader complexity
	•	ISO compatibility matrix
	•	firmware edge cases

⸻

A few important constraints shape this:

Ventoy’s plugin config lives in /ventoy/ventoy.json on the data partition, and plugin assets are stored under that same ventoy directory. Ventoy is GRUB2-based, so standard GRUB2 themes can be used, and the menu extension plugin loads a custom GRUB config file for extra menu entries.  

Recommended sonic-ventoy folder layout

Use this on the SONIC partition:

/ventoy/
  ventoy.json
  /theme/
    /udos-modern/
      theme.txt
      background.png
      /icons/
        install.png
        live.png
        recovery.png
        tools.png
        disk.png
  /grub/
    udos_menu.cfg

/images/
  /udos-ubuntu/
    udos-ubuntu-22.04.iso
  /recovery/
    systemrescue.iso
    memtest86.iso
  /extras/
    gparted-live.iso

This layout is compatible with Ventoy’s plugin model and keeps the theme and menu extension files in the expected ventoy tree.  

ventoy.json starter config

This example does four things:
	•	applies a uDOS theme
	•	adds menu classes for folders and image groups
	•	renames visible menu entries
	•	shows short context tips
	•	loads a custom GRUB menu extension file

{
  "theme": {
    "file": "/ventoy/theme/udos-modern/theme.txt"
  },

  "menu_class": [
    {
      "dir": "/images/udos-ubuntu",
      "class": "udos_ubuntu"
    },
    {
      "dir": "/images/recovery",
      "class": "udos_recovery"
    },
    {
      "dir": "/images/extras",
      "class": "udos_tools"
    },
    {
      "key": "ubuntu",
      "class": "udos_live"
    },
    {
      "key": "rescue",
      "class": "udos_recovery"
    },
    {
      "key": "memtest",
      "class": "udos_tools"
    },
    {
      "key": "gparted",
      "class": "udos_tools"
    }
  ],

  "menu_alias": [
    {
      "image": "/images/udos-ubuntu/udos-ubuntu-22.04.iso",
      "alias": "uDOS Ubuntu — Live / Install"
    },
    {
      "image": "/images/recovery/systemrescue.iso",
      "alias": "uDOS Recovery — System Rescue"
    },
    {
      "image": "/images/recovery/memtest86.iso",
      "alias": "uDOS Diagnostics — Memory Test"
    },
    {
      "image": "/images/extras/gparted-live.iso",
      "alias": "uDOS Tools — GParted Live"
    }
  ],

  "menu_tip": [
    {
      "image": "/images/udos-ubuntu/udos-ubuntu-22.04.iso",
      "tip": "Primary uDOS base system. Use for live boot or install."
    },
    {
      "image": "/images/recovery/systemrescue.iso",
      "tip": "Recovery environment for disk repair, backup, and rescue."
    },
    {
      "image": "/images/recovery/memtest86.iso",
      "tip": "Hardware memory diagnostics."
    },
    {
      "image": "/images/extras/gparted-live.iso",
      "tip": "Partition editor and storage utility."
    }
  ],

  "grubmenu": {
    "file": "/ventoy/grub/udos_menu.cfg"
  }
}

The keys used above map directly to Ventoy’s documented plugins: theme, menu_class, menu_alias, menu_tip, and grubmenu. Ventoy’s docs describe menu_class as supporting either dir or key, menu_alias as changing the displayed name only, menu_tip as showing a message when an item is selected, and grubmenu as loading a custom GRUB config file.  

udos_menu.cfg menu extension example

This is the curated uDOS layer that sits above the raw ISO list.

submenu "uDOS Ubuntu" {
    menuentry "uDOS Ubuntu — Live / Install Image List" --class udos_ubuntu --class udos_live {
        echo "Browse the uDOS Ubuntu image set from the standard Ventoy list."
    }

    menuentry "uDOS Ubuntu — Notes" --class udos_ubuntu {
        echo "Use the main image entry for normal live/install boot."
        echo "Autoinstall and injection can be layered by sonic-screwdriver later."
        sleep 3
    }
}

submenu "uDOS Recovery" {
    menuentry "System Rescue" --class udos_recovery {
        if [ -f "/images/recovery/systemrescue.iso" ]; then
            echo "Select 'uDOS Recovery — System Rescue' in the main image list to boot."
            sleep 3
        else
            echo "systemrescue.iso not found."
            sleep 3
        fi
    }

    menuentry "Memory Test" --class udos_tools {
        if [ -f "/images/recovery/memtest86.iso" ]; then
            echo "Select 'uDOS Diagnostics — Memory Test' in the main image list to boot."
            sleep 3
        else
            echo "memtest86.iso not found."
            sleep 3
        fi
    }
}

submenu "uDOS Tools" {
    menuentry "Partition Utility" --class udos_tools {
        if [ -f "/images/extras/gparted-live.iso" ]; then
            echo "Select 'uDOS Tools — GParted Live' in the main image list to boot."
            sleep 3
        else
            echo "gparted-live.iso not found."
            sleep 3
        fi
    }
}

menuentry "Boot Local Disk" --class udos_disk {
    exit
}

Ventoy’s menu extension plugin does allow you to load your own GRUB menu definitions, but it assumes you are comfortable writing GRUB syntax yourself. That makes it ideal for curated submenus and helper entries like the above.  

theme.txt starter theme

Ventoy uses GRUB2 themes, so the file below is a starter GRUB theme for a clean “modern Mac-ish” uDOS look. The exact visual tuning usually takes a few iterations, but this is the right shape.

desktop-image: "/ventoy/theme/udos-modern/background.png"

title-text: "uDOS Sonic Boot"
title-color: "#f2f2f2"
title-font: "Unifont Regular 18"

message-color: "#d0d0d0"
message-font: "Unifont Regular 14"
terminal-font: "Unifont Regular 14"

+ boot_menu {
    left = 8%
    top = 18%
    width = 46%
    height = 62%
    item_font = "Unifont Regular 16"
    item_color = "#d8d8d8"
    selected_item_color = "#111111"
    item_height = 28
    item_padding = 6
    item_icon_space = 12
    item_spacing = 4
    selected_item_pixmap_style = "select_*.png"
}

+ label {
    top = 10%
    left = 8%
    width = 50%
    height = 30
    text = "uDOS Ventoy"
    color = "#f2f2f2"
    font = "Unifont Regular 20"
}

+ label {
    top = 84%
    left = 8%
    width = 70%
    height = 24
    text = "Select a system, tool, or recovery environment"
    color = "#c8c8c8"
    font = "Unifont Regular 12"
}

+ hbox{
    left = 30%+200
    top = 95%-50
    width = 10%
    height = 25
    + label { text = "@VTOY_GRUB2_MODE@" color = "red" align = "left" }
}

Ventoy’s theme plugin accepts a theme file path in ventoy.json, and Ventoy’s GRUB2-mode documentation specifically notes that if you use a custom theme and want the GRUB2-mode indicator shown, your theme should include an hbox with @VTOY_GRUB2_MODE@ like the one above.  

Recommended class naming

Use a small internal taxonomy for consistent icons and future polish:

udos_ubuntu
udos_live
udos_install
udos_recovery
udos_tools
udos_disk
udos_experimental

This works well with Ventoy’s menu class plugin, which is designed to attach classes based on file-name keys or directory paths.  

Practical notes for uDOS

A small but important implementation detail: Ventoy’s normal menu is still image-driven, so the cleanest v2 setup is to use aliases, classes, tips, and a curated extension menu together rather than trying to completely replace the image list on day one. That keeps you close to upstream behavior while still making the stick feel like a uDOS product. This is an architectural recommendation based on Ventoy’s documented extension model rather than a Ventoy requirement.  

For your retro theme, you would keep the same ventoy.json shape and swap only:

{
  "theme": {
    "file": "/ventoy/theme/udos-retro/theme.txt"
  }
}

That is straightforward because the theme plugin just points to a GRUB theme file.  

Best next refinement

The next useful step is to split this into two concrete deliverables:
	1.	udos-modern theme assets and final theme.txt
	2.	udos-retro theme assets and matching theme.txt

and then define the ss init generator that writes ventoy.json automatically based on:
	•	chosen theme
	•	64GB or 128GB stick mode
	•	whether recovery images are included
	•	whether persistence is enabled

Great — here are the two starter theme profiles for sonic-ventoy.

They’re built around Ventoy’s documented plugin system: ventoy.json lives under /ventoy, Ventoy can use standard GRUB2 themes, menu_class can match by directory or filename key, and the menu extension plugin loads a custom GRUB config file.  

1) udos-modern

This is the default profile: cleaner, softer, more contemporary, with a Mac-adjacent feel.

Folder layout

/ventoy/
  ventoy.json
  /theme/
    /udos-modern/
      theme.txt
      background.png
      select_c.png
      select_e.png
      select_w.png
      /icons/
        udos_ubuntu.png
        udos_live.png
        udos_recovery.png
        udos_tools.png
        udos_disk.png
  /grub/
    udos_menu.cfg

ventoy.json for udos-modern

{
  "theme": {
    "file": "/ventoy/theme/udos-modern/theme.txt"
  },

  "menu_class": [
    { "dir": "/images/udos-ubuntu", "class": "udos_ubuntu" },
    { "dir": "/images/recovery", "class": "udos_recovery" },
    { "dir": "/images/extras", "class": "udos_tools" },

    { "key": "ubuntu", "class": "udos_live" },
    { "key": "proton", "class": "udos_tools" },
    { "key": "rescue", "class": "udos_recovery" },
    { "key": "memtest", "class": "udos_tools" },
    { "key": "gparted", "class": "udos_tools" }
  ],

  "menu_alias": [
    {
      "image": "/images/udos-ubuntu/udos-ubuntu-22.04.iso",
      "alias": "uDOS Ubuntu — Base System"
    },
    {
      "image": "/images/recovery/systemrescue.iso",
      "alias": "uDOS Recovery — System Rescue"
    },
    {
      "image": "/images/recovery/memtest86.iso",
      "alias": "uDOS Diagnostics — Memory Test"
    },
    {
      "image": "/images/extras/gparted-live.iso",
      "alias": "uDOS Tools — Partition Utility"
    }
  ],

  "menu_tip": [
    {
      "image": "/images/udos-ubuntu/udos-ubuntu-22.04.iso",
      "tip": "Primary uDOS base image. Use for live boot or local install."
    },
    {
      "image": "/images/recovery/systemrescue.iso",
      "tip": "Recovery environment for repair, backup, and rescue."
    },
    {
      "image": "/images/recovery/memtest86.iso",
      "tip": "Hardware memory diagnostics."
    },
    {
      "image": "/images/extras/gparted-live.iso",
      "tip": "Partitioning and storage management."
    }
  ],

  "grubmenu": {
    "file": "/ventoy/grub/udos_menu.cfg"
  }
}

The shape above follows Ventoy’s official plugin model for theme, menu class, alias, tip, and custom GRUB menu loading.  

theme.txt for udos-modern

desktop-image: "/ventoy/theme/udos-modern/background.png"

title-text: "uDOS Sonic Boot"
title-color: "#f4f4f4"
title-font: "Unifont Regular 18"

message-color: "#d6d6d6"
message-font: "Unifont Regular 13"
terminal-font: "Unifont Regular 13"

+ boot_menu {
    left = 7%
    top = 16%
    width = 48%
    height = 64%
    item_font = "Unifont Regular 16"
    item_color = "#dddddd"
    selected_item_color = "#101010"
    item_height = 30
    item_padding = 7
    item_icon_space = 10
    item_spacing = 4
    selected_item_pixmap_style = "select_*.png"
}

+ label {
    top = 8%
    left = 7%
    width = 50%
    height = 30
    text = "uDOS Ventoy"
    color = "#ffffff"
    font = "Unifont Regular 20"
}

+ label {
    top = 84%
    left = 7%
    width = 72%
    height = 24
    text = "Select a system, tool, or recovery environment"
    color = "#c8c8c8"
    font = "Unifont Regular 12"
}

+ hbox{
    left = 30%+200
    top = 95%-50
    width = 10%
    height = 25
    + label { text = "@VTOY_GRUB2_MODE@" color = "red" align = "left" }
}

Ventoy’s theme docs note it can use GRUB2 themes, and Ventoy’s GRUB2-mode guidance calls out the @VTOY_GRUB2_MODE@ label pattern when you want that mode indicator visible in a custom theme.  

Visual direction for udos-modern

Use:
	•	soft gray or graphite background
	•	subtle panel contrast
	•	rounded selection art in select_c.png, select_e.png, select_w.png
	•	monochrome or low-saturation icons
	•	modern typography spacing, while keeping a boot-safe bitmap/unifont fallback

That last point is a design recommendation rather than a Ventoy requirement.

⸻

2) udos-retro

This is the System 7 / early Mac-inspired mode: flatter, higher contrast, slightly more playful, more overtly “classic computer.”

Folder layout

/ventoy/
  ventoy.json
  /theme/
    /udos-retro/
      theme.txt
      background.png
      select_c.png
      select_e.png
      select_w.png
      /icons/
        udos_ubuntu.png
        udos_live.png
        udos_recovery.png
        udos_tools.png
        udos_disk.png

ventoy.json for udos-retro

Same structure, just switch the theme path:

{
  "theme": {
    "file": "/ventoy/theme/udos-retro/theme.txt"
  },

  "menu_class": [
    { "dir": "/images/udos-ubuntu", "class": "udos_ubuntu" },
    { "dir": "/images/recovery", "class": "udos_recovery" },
    { "dir": "/images/extras", "class": "udos_tools" },

    { "key": "ubuntu", "class": "udos_live" },
    { "key": "rescue", "class": "udos_recovery" },
    { "key": "memtest", "class": "udos_tools" },
    { "key": "gparted", "class": "udos_tools" }
  ],

  "menu_alias": [
    {
      "image": "/images/udos-ubuntu/udos-ubuntu-22.04.iso",
      "alias": "uDOS Ubuntu — Base System"
    },
    {
      "image": "/images/recovery/systemrescue.iso",
      "alias": "uDOS Recovery — System Rescue"
    },
    {
      "image": "/images/recovery/memtest86.iso",
      "alias": "uDOS Diagnostics — Memory Test"
    },
    {
      "image": "/images/extras/gparted-live.iso",
      "alias": "uDOS Tools — Partition Utility"
    }
  ],

  "menu_tip": [
    {
      "image": "/images/udos-ubuntu/udos-ubuntu-22.04.iso",
      "tip": "Run live, install local, or prepare a fresh uDOS machine."
    },
    {
      "image": "/images/recovery/systemrescue.iso",
      "tip": "Repair drives, recover files, and inspect system state."
    },
    {
      "image": "/images/recovery/memtest86.iso",
      "tip": "Test RAM and hardware stability."
    },
    {
      "image": "/images/extras/gparted-live.iso",
      "tip": "Edit partitions and inspect storage devices."
    }
  ],

  "grubmenu": {
    "file": "/ventoy/grub/udos_menu.cfg"
  }
}

theme.txt for udos-retro

desktop-image: "/ventoy/theme/udos-retro/background.png"

title-text: "uDOS Sonic Boot"
title-color: "#000000"
title-font: "Unifont Regular 18"

message-color: "#111111"
message-font: "Unifont Regular 13"
terminal-font: "Unifont Regular 13"

+ boot_menu {
    left = 6%
    top = 14%
    width = 50%
    height = 66%
    item_font = "Unifont Regular 16"
    item_color = "#000000"
    selected_item_color = "#ffffff"
    item_height = 28
    item_padding = 6
    item_icon_space = 8
    item_spacing = 2
    selected_item_pixmap_style = "select_*.png"
}

+ label {
    top = 7%
    left = 6%
    width = 60%
    height = 30
    text = "uDOS Ventoy"
    color = "#000000"
    font = "Unifont Regular 20"
}

+ label {
    top = 83%
    left = 6%
    width = 72%
    height = 24
    text = "Classic boot mode — keyboard or controller navigation"
    color = "#222222"
    font = "Unifont Regular 12"
}

+ hbox{
    left = 30%+200
    top = 95%-50
    width = 10%
    height = 25
    + label { text = "@VTOY_GRUB2_MODE@" color = "blue" align = "left" }
}

Visual direction for udos-retro

Use:
	•	light gray striped or dithered background
	•	crisp rectangular selection graphics
	•	black line icons with 1-bit or near-1-bit styling
	•	sharper contrast and tighter spacing
	•	subtle “platinum era” window feel

Again, that is a design recommendation layered on top of Ventoy’s GRUB theme support.  

⸻

Shared udos_menu.cfg

Use one shared menu extension file for both themes:

submenu "uDOS Ubuntu" {
    menuentry "Base System" --class udos_ubuntu --class udos_live {
        echo "Use the main image list to boot the uDOS Ubuntu base image."
        sleep 2
    }

    menuentry "Install Notes" --class udos_ubuntu {
        echo "Autoinstall, profile injection, and bootstrap hooks can be supplied by sonic-screwdriver."
        sleep 3
    }
}

submenu "uDOS Recovery" {
    menuentry "System Rescue" --class udos_recovery {
        echo "Select the System Rescue image from the main list."
        sleep 2
    }

    menuentry "Memory Test" --class udos_tools {
        echo "Select the Memory Test image from the main list."
        sleep 2
    }
}

submenu "uDOS Tools" {
    menuentry "Partition Utility" --class udos_tools {
        echo "Select the Partition Utility image from the main list."
        sleep 2
    }
}

menuentry "Boot Local Disk" --class udos_disk {
    exit
}

Ventoy’s menu extension plugin supports loading a custom GRUB config file for exactly this kind of extra curated menu layer.  

⸻

Suggested icon class mapping

Ventoy’s menu class plugin maps image entries to classes, and those classes correspond to icon names in the theme’s icons directory. Official docs and Ventoy forum guidance both point to this model.  

Use this class set:

udos_ubuntu
udos_live
udos_recovery
udos_tools
udos_disk

And provide matching icon files:

/ventoy/theme/udos-modern/icons/udos_ubuntu.png
/ventoy/theme/udos-modern/icons/udos_live.png
...
/ventoy/theme/udos-retro/icons/udos_ubuntu.png
/ventoy/theme/udos-retro/icons/udos_live.png
...


⸻

Recommended theme behavior in ss

Have uDOS-sonic-screwdriver generate these modes:
	•	ss theme modern
	•	ss theme retro

Which simply swap the theme.file path in ventoy.json and refresh assets on the SONIC partition.

For multi-theme support, Ventoy also has theme plugin support around default theme selection, though the exact implementation details are better kept inside your generated config flow rather than exposed to users directly.  

⸻

My recommendation

Set:
	•	default boot theme: udos-modern
	•	alternate boot theme: udos-retro

That gives uDOS a polished default identity while preserving the more nostalgic mode as a first-class switch, not a novelty.

⸻

Next is the sonic-ventoy Theme Asset Specification v1, covering:
	•	file structure contracts
	•	required + optional assets
	•	dimensions + formats
	•	naming rules
	•	visual tokens (modern + retro)
	•	selection graphics system
	•	icon system

⸻

sonic-ventoy

Theme Asset Specification v1

⸻

Core Principle

Themes are:

pure asset + config layers (no logic)

They must be:
	•	swappable
	•	lightweight
	•	boot-safe (low memory / simple formats)
	•	consistent across all uDOS boot environments

⸻

Theme Structure (Required)

Each theme must follow this exact structure:

/ventoy/theme/<theme-name>/

theme.txt
background.png

select_c.png
select_e.png
select_w.png

/icons/
  udos_ubuntu.png
  udos_live.png
  udos_recovery.png
  udos_tools.png
  udos_disk.png


⸻

File Types

Asset Type	Format	Notes
Background	PNG	No transparency required
Selection graphics	PNG	Must support slicing
Icons	PNG	Transparent background
Theme config	.txt	GRUB theme syntax


⸻

Background Specification

Dimensions

Recommended:
	•	1920 × 1080

Fallback-safe:
	•	1366 × 768

⸻

Behaviour
	•	static image (no animation)
	•	scaled by GRUB if needed
	•	must remain readable at lower resolutions

⸻

Safe Zones

Avoid placing important elements:
	•	left 0–20% → menu area
	•	bottom 10% → message + status

⸻

Visual Guidelines

udos-modern
	•	soft gradients or flat graphite
	•	subtle texture (optional)
	•	no noise-heavy patterns
	•	high contrast with white text

⸻

udos-retro
	•	light grey (System 7 style)
	•	optional:
	•	1px stripe pattern
	•	dither texture
	•	strong black text contrast

⸻

Selection Graphics System

GRUB themes use a 3-part selection image system:

select_w.png  → left cap
select_c.png  → center (repeats)
select_e.png  → right cap


⸻

Dimensions

File	Width	Height
select_w.png	8–16px	28–32px
select_c.png	8–16px	28–32px
select_e.png	8–16px	28–32px


⸻

Behaviour
	•	center image tiles horizontally
	•	must align seamlessly
	•	height must match item_height in theme.txt

⸻

Visual Style

udos-modern
	•	rounded rectangle
	•	soft highlight (subtle gradient)
	•	light fill (white / soft grey)
	•	dark text on selection

⸻

udos-retro
	•	square edges
	•	inverted highlight
	•	black or dark fill
	•	white text when selected

⸻

Icon System

Location

/icons/


⸻

Required Icons

Class	File
Ubuntu	udos_ubuntu.png
Live	udos_live.png
Recovery	udos_recovery.png
Tools	udos_tools.png
Disk	udos_disk.png


⸻

Dimensions
	•	32 × 32 px (recommended)
	•	minimum: 24 × 24 px

⸻

Format
	•	PNG
	•	transparent background
	•	no anti-aliasing blur at small sizes

⸻

Style Guidelines

udos-modern
	•	minimal
	•	monochrome or 2-color
	•	soft edges
	•	slightly rounded

Examples:
	•	circle + arrow (live)
	•	wrench (tools)
	•	shield/plus (recovery)

⸻

udos-retro
	•	pixel-style
	•	hard edges
	•	1-bit or low color (2–4 colors)
	•	classic Mac icon inspiration

⸻

Typography

Constraint

GRUB has limited font support

⸻

Recommended
	•	use:
	•	Unifont
	•	or bitmap-compatible fonts

⸻

Sizes

Use	Size
Title	18–20
Menu items	14–16
Footer text	11–12


⸻

Color Tokens

Define consistent tokens per theme.

⸻

udos-modern

BACKGROUND_PRIMARY = #1e1e1e
TEXT_PRIMARY = #f4f4f4
TEXT_SECONDARY = #c8c8c8
MENU_ITEM = #dddddd
MENU_SELECTED_TEXT = #101010
ACCENT = #8ab4f8


⸻

udos-retro

BACKGROUND_PRIMARY = #c0c0c0
TEXT_PRIMARY = #000000
TEXT_SECONDARY = #222222
MENU_ITEM = #000000
MENU_SELECTED_TEXT = #ffffff
ACCENT = #000080


⸻

Layout Tokens

These must align with theme.txt

⸻

Menu Block

LEFT: 6–8%
TOP: 14–18%
WIDTH: 45–50%
HEIGHT: 60–66%


⸻

Item Sizing

ITEM_HEIGHT: 28–32px
ITEM_PADDING: 6–8px
ITEM_SPACING: 2–4px
ICON_SPACING: 8–12px


⸻

Theme Config Contract (theme.txt)

Must include:
	•	desktop-image
	•	boot_menu
	•	label (title)
	•	label (footer)
	•	hbox with @VTOY_GRUB2_MODE@

⸻

Asset Naming Rules

Strict:
	•	lowercase only
	•	underscores only
	•	no spaces
	•	no versioning in filenames

⸻

Performance Constraints
	•	keep total theme size < 5MB
	•	avoid large textures
	•	avoid transparency-heavy overlays
	•	optimise PNGs

⸻

Fallback Behaviour

If assets fail:
	•	GRUB falls back to basic UI
	•	therefore:
	•	no critical info should exist only in images

⸻

Future Extensions (v2.1+)

Planned:
	•	animated boot splash (plymouth sync)
	•	multiple theme packs downloadable via ss
	•	dynamic theme switching per device/profile
	•	uHOME-linked theme sync

⸻

Summary

This spec ensures:
	•	consistent visual identity across all uDOS boot devices
	•	clean separation of assets vs logic
	•	fast, reliable boot rendering
	•	easy theme swapping and expansion

⸻

Final Position

sonic-ventoy themes are not decoration
they are the first layer of the uDOS experience

⸻

If you want next step, I can:

👉 generate a ready-to-use asset pack (placeholders + correct dimensions)
👉 or define the ss build step that auto-generates themes + config onto the stick