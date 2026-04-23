# uDOS Library Site

This folder is a static GitHub Pages scaffold for the public uDOS library home.

It is intended to become the family landing page for:

- family repo index grouped by role
- docs, wiki, and learning entrypoints
- featured reference and policy docs
- GitHub links for repos, issues, pull requests, and contributors
- simple client-side filtering for repo discovery

## Files

- `index.html`
- `manifest.html`
- `learning.html`
- `reference.html`
- `runtime.html`
- `surface.html`
- `operations.html`
- `styles.css`
- `app.js`
- `data/family.json`
- `data/library-manifest.json`

## Current Structure

The site currently exposes:

- start cards
- generated learning and reference hubs
- role-based track cards
- track landing pages for runtime, surface, and operations
- generated human and machine-readable manifest outputs
- learning and wiki links
- featured references
- grouped repo sections
- GitHub navigation cards

## Publish Direction

Publish this folder through GitHub Pages once the deployment choice is locked.

The current workflow regenerates `site/data/family.json`, runs docs checks, and then publishes `/site`.
