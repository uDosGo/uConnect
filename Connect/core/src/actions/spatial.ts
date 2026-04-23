/**
 * Spatial Algebra v1.4 — voxel, cube, surface commands
 * See docs/specs/v4/UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md
 */

import { getVaultRoot } from "../paths.js";
import { ensureDir, readJSON, writeJSON } from "fs-extra/esm";
import path from "node:path";
import { createSurface as createGridSurface, renderSurface } from "@udos/ugridcomposer";

// Types
interface VoxelCell {
  x: number;
  y: number;
  z: number;
  content?: string;
}

interface DepthCube {
  x: number;
  y: number;
  cells: VoxelCell[];
}

interface Surface {
  id: string;
  cubes: DepthCube[];
  createdAt: string;
}

// Paths
const SURFACES_DIR = path.join(getVaultRoot(), "surfaces");
const SURFACES_INDEX = path.join(SURFACES_DIR, "index.json");

// Ensure surfaces directory
async function ensureSurfacesDir() {
  await ensureDir(SURFACES_DIR);
}

// Load surfaces index
async function loadSurfacesIndex(): Promise<Surface[]> {
  try {
    return (await readJSON(SURFACES_INDEX)) as Surface[];
  } catch (e) {
    return [];
  }
}

// Save surfaces index
async function saveSurfacesIndex(surfaces: Surface[]) {
  await writeJSON(SURFACES_INDEX, surfaces, { spaces: 2 });
}

// Navigate to a voxel cell
export async function cmdCellNavigate(x: number, y: number, z: number) {
  const vaultRoot = getVaultRoot();
  console.log(`Vault root: ${vaultRoot}`);
  console.log(`Navigating to cell (${x}, ${y}, ${z})`);
  // TODO: Integrate with uGridComposer for rendering
  return { x, y, z };
}

// Render a depth cube
export async function cmdCubeRender(x: number, y: number) {
  console.log(`Rendering cube at (${x}, ${y})`);
  const grid = createGridSurface(6, 6);
  for (let z = 0; z < 6; z++) {
    grid.layers[0].cells.push({ x, y, z, char: "■" });
  }
  console.log(renderSurface(grid, { mode: "ansi" }));
  return grid;
}

// Create a surface
export async function cmdSurfaceCreate(id: string, cubes?: number[]) {
  await ensureSurfacesDir();
  const surfaces = await loadSurfacesIndex();
  if (surfaces.some((s) => s.id === id)) {
    throw new Error(`Surface ${id} already exists`);
  }
  const surface: Surface = {
    id,
    cubes: cubes?.map((coord, i) => ({
      x: i % 2,
      y: Math.floor(i / 2),
      cells: Array(6)
        .fill(0)
        .map((_, z) => ({ x: i % 2, y: Math.floor(i / 2), z })),
    })) || [],
    createdAt: new Date().toISOString(),
  };
  surfaces.push(surface);
  await saveSurfacesIndex(surfaces);
  console.log(`Created surface ${id} with ${surface.cubes.length} cubes`);
  return surface;
}

// List surfaces
export async function cmdSurfaceList() {
  await ensureSurfacesDir();
  const surfaces = await loadSurfacesIndex();
  if (surfaces.length === 0) {
    console.log("No surfaces found");
  } else {
    surfaces.forEach((s) => console.log(`${s.id}: ${s.cubes.length} cubes`));
  }
  return surfaces;
}

// Show surface details
export async function cmdSurfaceShow(id: string) {
  await ensureSurfacesDir();
  const surfaces = await loadSurfacesIndex();
  const surface = surfaces.find((s) => s.id === id);
  if (!surface) {
    throw new Error(`Surface ${id} not found`);
  }
  console.log(`Surface ${surface.id}:`);
  console.log(`  Cubes: ${surface.cubes.length}`);
  console.log(`  Created: ${surface.createdAt}`);
  
  // Render first cube via uGridComposer
  if (surface.cubes.length > 0) {
    const cube = surface.cubes[0];
    const grid = createGridSurface(6, 6);
    cube.cells.forEach((cell) => {
      grid.layers[0].cells.push({ ...cell, char: "■" });
    });
    console.log("\nCube preview:");
    console.log(renderSurface(grid, { mode: "ansi" }));
  }
  
  return surface;
}
