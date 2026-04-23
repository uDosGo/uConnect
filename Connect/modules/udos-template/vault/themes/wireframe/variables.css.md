# CSS Variables — Wireframe Theme

```css
:root {
  --color-ink: #000000;
  --color-paper: #ffffff;
  --color-grid-line: #e0e0e0;
  --color-grid-major: #c0c0c0;

  --font-mono: "Monaco", "Courier New", monospace;
  --font-sans: "Geneva", "Helvetica", sans-serif;
  --font-serif: "New York", "Times New Roman", serif;

  --grid-base: 8px;
  --tile-width: calc(var(--grid-base) * 2);
  --tile-height: calc(var(--grid-base) * 6);
  --cell-size: var(--grid-base);

  --qr-scale: 2;
  --qr-width: calc(var(--cell-size) * 2);
  --qr-height: calc(var(--cell-size) * 3);
}
```
