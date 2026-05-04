/**
 * Tower of Knowledge v1.4 — slot-based storage
 * See docs/specs/v4/UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md
 */

import { getVaultRoot } from "../paths.js";
import { ensureDir, readJSON, writeJSON, mkdirp } from "fs-extra/esm";
import { readdir } from "node:fs/promises";
import path from "node:path";

// Types
interface TowerSlot {
  id: number;
  name: string;
  surfaces: string[];
}

// Slot definitions
const SLOTS: Record<number, { name: string; color: string }> = {
  0: { name: "Private", color: "black" },
  1: { name: "Public Local", color: "green" },
  2: { name: "Password Local", color: "yellow" },
  3: { name: "Group Local", color: "orange" },
  4: { name: "Unpublished Cloud", color: "white" },
  5: { name: "Published Public", color: "blue" },
  6: { name: "Password Cloud", color: "purple" },
  7: { name: "Group Cloud", color: "red" },
};

// Paths
const TOWER_DIR = path.join(getVaultRoot(), "vault", "tower");
const TOWER_INDEX = path.join(TOWER_DIR, "index.json");

// Ensure tower directory
async function ensureTowerDir() {
  await ensureDir(TOWER_DIR);
  for (const slotId of Object.keys(SLOTS).map(Number)) {
    await ensureDir(path.join(TOWER_DIR, `slot_${slotId}_${SLOTS[slotId].name.toLowerCase().replace(/ /g, "_")}`));
  }
}

// Load tower index
async function loadTowerIndex(): Promise<TowerSlot[]> {
  try {
    return (await readJSON(TOWER_INDEX)) as TowerSlot[];
  } catch (e) {
    return Object.keys(SLOTS).map((id) => ({
      id: Number(id),
      name: SLOTS[Number(id)].name,
      surfaces: [],
    }));
  }
}

// Save tower index
async function saveTowerIndex(slots: TowerSlot[]) {
  await writeJSON(TOWER_INDEX, slots, { spaces: 2 });
}

// View all slots
export async function cmdTowerView() {
  await ensureTowerDir();
  const slots = await loadTowerIndex();
  console.log("Tower of Knowledge:");
  slots.forEach((slot) => {
    console.log(`  Slot ${slot.id} (${slot.name}): ${slot.surfaces.length} surfaces`);
  });
  return slots;
}

// List surfaces in a slot
export async function cmdTowerList(slotId: number) {
  await ensureTowerDir();
  const slots = await loadTowerIndex();
  const slot = slots.find((s) => s.id === slotId);
  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }
  console.log(`Slot ${slotId} (${slot.name}):`);
  if (slot.surfaces.length === 0) {
    console.log("  No surfaces");
  } else {
    slot.surfaces.forEach((surface) => console.log(`  - ${surface}`));
  }
  return slot;
}

// Move a surface to a slot
export async function cmdTowerMove(surfaceId: string, toSlotId: number) {
  await ensureTowerDir();
  const slots = await loadTowerIndex();
  const fromSlot = slots.find((s) => s.surfaces.includes(surfaceId));
  const toSlot = slots.find((s) => s.id === toSlotId);
  if (!toSlot) {
    throw new Error(`Slot ${toSlotId} not found`);
  }
  if (fromSlot) {
    fromSlot.surfaces = fromSlot.surfaces.filter((s) => s !== surfaceId);
  }
  toSlot.surfaces.push(surfaceId);
  await saveTowerIndex(slots);
  console.log(`Moved ${surfaceId} to slot ${toSlotId}`);
  return { surfaceId, fromSlot: fromSlot?.id, toSlot: toSlotId };
}

// Publish a surface to slot 5 (Global Knowledge Bank)
export async function cmdTowerPublish(surfaceId: string) {
  await ensureTowerDir();
  const result = await cmdTowerMove(surfaceId, 5);
  console.log(`Published ${surfaceId} to Global Knowledge Bank (slot 5)`);
  // TODO: Sync to cloud (A2)
  return result;
}
