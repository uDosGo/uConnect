# Experiment 1 — Retro themes harness

## Vendor clones

From **repo root**:

```bash
mkdir -p dev/experiments/theme-integration/experiment-1-retro/vendor
cd dev/experiments/theme-integration/experiment-1-retro/vendor
git clone https://github.com/fredporter/NES.css
git clone https://github.com/fredporter/bedstead
git clone https://github.com/fredporter/c64css3
```

## NES.css build (optional local)

The **NES.css** fork ships SCSS; built CSS appears under `css/` after:

```bash
cd vendor/NES.css
npm install
npm run build
```

`index.html` first tries `vendor/NES.css/css/nes.min.css`.

On modern Node, local build may fail (`node-sass` + legacy `node-gyp`/python expectations). The harness now falls back to CDN `https://unpkg.com/nes.css@2.3.0/css/nes.min.css` when local CSS is missing.

## Run

Open `index.html` via a static server (recommended — some browsers restrict `file:` + `@font-face`):

```bash
cd dev/experiments/theme-integration/experiment-1-retro
npx --yes serve -p 5174
```

Then choose **Theme** in the header and confirm the shell (header / dock / main / notes / footer) stays intact.
