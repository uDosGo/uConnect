# uGridComposer

**ASCII/ANSI grid editor for uDos surfaces**

Inspired by [ascii-editor](https://github.com/andresoviedo/ascii-editor), this module provides a simple grid-based surface editor for uDos.

## Features

- Create and manage grid surfaces
- Render surfaces in ASCII, ANSI, or HTML
- Integrate with uDos spatial algebra

## Installation

```bash
npm install @udos/ugridcomposer
```

## Usage

```typescript
import { createSurface, addCell, renderSurface } from "@udos/ugridcomposer";

const surface = createSurface(6, 6);
addCell(surface, "base", { x: 0, y: 0, z: 0, char: "■", fg: "#ff0000" });
console.log(renderSurface(surface, { mode: "ansi" }));
```

## CLI Integration

The module is used by `udo cube` and `udo surface show` to render spatial surfaces.

## API

### `createSurface(width: number, height: number, depth?: number): GridSurface`
Create a new surface.

### `addLayer(surface: GridSurface, layerId: string): GridSurface`
Add a layer to a surface.

### `addCell(surface: GridSurface, layerId: string, cell: GridCell): GridSurface`
Add a cell to a layer.

### `renderSurface(surface: GridSurface, options?: RenderOptions): string`
Render a surface in ASCII, ANSI, or HTML.

## Types

```typescript
interface GridCell {
  x: number;
  y: number;
  z: number;
  char?: string;
  fg?: string;
  bg?: string;
}

interface GridLayer {
  id: string;
  cells: GridCell[];
}

interface GridSurface {
  width: number;
  height: number;
  depth: number;
  layers: GridLayer[];
}
```

## License

MIT
