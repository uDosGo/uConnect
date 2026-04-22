# Experiment 2 — notion.css (pure CSS)

## Vendor clone

From **repo root**:

```bash
mkdir -p dev/experiments/theme-integration/experiment-2-notion-css/vendor
cd dev/experiments/theme-integration/experiment-2-notion-css/vendor
git clone https://github.com/sreeram-venkitesh/notion.css.git
```

Upstream may redirect to fillerInk fork; either clone works if `src/notion.css` exists.

**Stylesheet path used by the harness:** `vendor/notion.css/src/notion.css` (no build step).

## Run

```bash
cd dev/experiments/theme-integration/experiment-2-notion-css
npx --yes serve -p 5175
```

Open the page, toggle **Surface** between default shell and Notion.css, and exercise table / list / card / form in the centre column.

## Focus (from master brief)

- Table view (sortable headers optional — not in upstream CSS)
- List with checkboxes
- Card gallery
- Form controls

Record results in [`notes.md`](notes.md).
