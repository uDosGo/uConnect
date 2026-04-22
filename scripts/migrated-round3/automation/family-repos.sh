#!/usr/bin/env bash

set -eu

ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
OWNER="${OWNER:-fredporter}"

public_repos=(
  uDOS-core
  uDOS-shell
  uDOS-surface
  sonic-screwdriver
  uDOS-plugin-index
  uDOS-wizard
  uDOS-gameplay
  uDOS-gpthelper
  uDOS-grid
  uDOS-groovebox
  uDOS-empire
  uHOME-matter
  uDOS-dev
  uDOS-themes
  uDOS-thinui
  uDOS-workspace
  uDOS-docs
  uDOS-alpine
  uDOS-host
  sonic-ventoy
  uHOME-client
  uHOME-server
  uHOME-app-android
  uHOME-app-ios
)

private_repos=(
  omd-mac-osx-app
)

all_repos=("${public_repos[@]}" "${private_repos[@]}")

is_public_repo() {
  local repo="$1"
  local item
  for item in "${public_repos[@]}"; do
    if [ "$item" = "$repo" ]; then
      return 0
    fi
  done
  return 1
}

repo_description() {
  case "$1" in
    uDOS-core) echo "Deterministic runtime contracts and execution semantics for the uDOS v2 family." ;;
    uDOS-shell) echo "Public interactive shell and operator-facing UI patterns for uDOS v2." ;;
    uDOS-surface) echo "Browser Surface and experience orchestration; Wizard broker lane for uDOS v2." ;;
    sonic-screwdriver) echo "Packaging, bootstrap, install, update, and managed environment tooling for the uDOS family." ;;
    uDOS-plugin-index) echo "Public index for plugin manifests, package metadata, and capability declarations." ;;
    uDOS-wizard) echo "Network-facing assist, provider, MCP, and bounded autonomy services for uDOS v2." ;;
    uDOS-gameplay) echo "Gameplay and interactive simulation patterns built on canonical uDOS state." ;;
    uDOS-gpthelper) echo "GPT bridge specs, OpenAPI actions, prompts, and examples for uDOS-connected custom GPTs." ;;
    uDOS-grid) echo "Canonical spatial identity, layers, seed registries, and place-bound artifacts for uDOS v2." ;;
    uDOS-groovebox) echo "Pattern-first music sequencing, transport bridges, and portable composition artifacts for uDOS v2." ;;
    uDOS-empire) echo "Remote operations, sync, CRM, workflow, and publishing extension surfaces for the command-centre family." ;;
    uHOME-matter) echo "Matter, Home Assistant, and local automation extension surfaces for the uHOME v2 family." ;;
    uDOS-dev) echo "Family governance, binder workflow, contributor intake, and automation for uDOS v2." ;;
    uDOS-themes) echo "Public theme packs, token sets, and shell-facing visual assets for the uDOS family." ;;
    uDOS-thinui) echo "Low-resource fullscreen ThinUI takeover runtime between TUI and browser apps." ;;
    uDOS-workspace) echo "Binder-facing workspace web shell, packages, and integration surfaces for uDOS v2." ;;
    uDOS-docs) echo "Canonical public documentation repo for the uDOS v2 and uHOME family." ;;
    uDOS-alpine) echo "Lean Alpine Linux runtime profile: Core plus TUI and ThinUI only, designed to pair with the Ubuntu command centre when present." ;;
    uDOS-host) echo "Always-on host runtime (Ubuntu baseline) for networking, vault, scheduling, sync, browser GUI, command centre, and operator shell." ;;
    sonic-ventoy) echo "Ventoy-compatible boot substrate, theme templates, and curated menu extension layer for sonic-stick media." ;;
    uHOME-client) echo "Public client surfaces for local-network home and server interactions." ;;
    uHOME-server) echo "uHOME-specific service stream that sits behind the family runtime spine rather than owning the primary command centre." ;;
    uHOME-app-android) echo "Android application for the v2 uHOME mobile and kiosk client lane." ;;
    uHOME-app-ios) echo "iOS application for the v2 uHOME mobile and kiosk client lane." ;;
    omd-mac-osx-app) echo "Private macOS desktop application for OMD product work." ;;
    *) echo "" ;;
  esac
}

repo_topics() {
  case "$1" in
    uDOS-core) echo "udos,udos-v2,runtime,contracts,offline-first" ;;
    uDOS-shell) echo "udos,udos-v2,shell,ucode,tui" ;;
    uDOS-surface) echo "udos,udos-v2,surface,wizard,gui" ;;
    sonic-screwdriver) echo "udos,udos-v2,packaging,bootstrap,deployment" ;;
    uDOS-plugin-index) echo "udos,udos-v2,plugins,registry,metadata" ;;
    uDOS-wizard) echo "udos,udos-v2,network,mcp,providers" ;;
    uDOS-gameplay) echo "udos,udos-v2,gameplay,simulation,modules" ;;
    uDOS-gpthelper) echo "udos,udos-v2,gpt,openapi,integrations" ;;
    uDOS-grid) echo "udos,udos-v2,grid,spatial,identity" ;;
    uDOS-groovebox) echo "udos,udos-v2,music,groovebox,sequencing" ;;
    uDOS-empire) echo "uhome,udos-v2,sync,crm,publishing" ;;
    uHOME-matter) echo "uhome,matter,home-assistant,automation,local-network" ;;
    uDOS-dev) echo "udos,udos-v2,governance,workflow,automation" ;;
    uDOS-themes) echo "udos,udos-v2,themes,tokens,design" ;;
    uDOS-thinui) echo "udos,udos-v2,thinui,gui,takeover" ;;
    uDOS-workspace) echo "udos,udos-v2,workspace,sveltekit,binder" ;;
    uDOS-docs) echo "udos,udos-v2,documentation,education,architecture" ;;
    uDOS-alpine) echo "udos,udos-v2,alpine,packaging,profiles" ;;
    uDOS-host) echo "udos,udos-v2,host,ubuntu,command-centre" ;;
    sonic-ventoy) echo "udos,udos-v2,ventoy,boot,deployment" ;;
    uHOME-client) echo "udos,uhome,client,local-network,ui" ;;
    uHOME-server) echo "udos,uhome,server,scheduling,services" ;;
    uHOME-app-android) echo "uhome,android,mobile,kiosk,client" ;;
    uHOME-app-ios) echo "uhome,ios,mobile,kiosk,client" ;;
    omd-mac-osx-app) echo "omd,private,macos,desktop,udos-compatible" ;;
    *) echo "" ;;
  esac
}

repo_docs_url() {
  case "$1" in
    uDOS-dev) echo "https://github.com/${OWNER}/uDOS-dev" ;;
    uDOS-docs) echo "https://github.com/${OWNER}/uDOS-docs" ;;
    *) echo "" ;;
  esac
}
