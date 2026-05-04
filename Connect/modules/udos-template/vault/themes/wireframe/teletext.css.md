# Teletext grid — Wireframe

```css
.teletext-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols, 24), var(--cell-size));
  gap: 1px;
  background: var(--color-grid-line);
}

.teletext-tile {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(6, 1fr);
  background: var(--color-paper);
  border: 1px solid var(--color-grid-major);
  min-height: 120px;
}

.teletext-cell {
  aspect-ratio: 2 / 3;
  position: relative;
  border: 1px solid var(--color-grid-line);
  padding: 2px;
}

.teletext-cell .qr-code {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```
