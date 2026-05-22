<template>
  <div class="maps-panel" data-panel="maps">
    <!-- Grid Canvas -->
    <div class="maps-canvas" ref="canvasRef">
      <div class="maps-grid">
        <div
          v-for="(row, rowIdx) in gridData"
          :key="rowIdx"
          class="maps-row"
        >
          <div
            v-for="(cell, colIdx) in row"
            :key="colIdx"
            class="maps-cell"
            :style="cellStyle(cell)"
            :title="`(${colIdx}, ${rowIdx})`"
          >{{ cell.char }}</div>
        </div>
      </div>
    </div>

    <!-- Layer Controls -->
    <aside class="maps-sidebar">
      <div class="maps-sidebar-header">
        <span class="material-symbol maps-sidebar-icon">layers</span>
        <span class="maps-sidebar-title">Layers</span>
      </div>

      <div class="maps-layers">
        <div
          v-for="layer in store.gridLayers"
          :key="layer.id"
          class="maps-layer"
          :class="{ 'maps-layer--visible': layer.visible }"
        >
          <label class="maps-layer-toggle">
            <input
              type="checkbox"
              :checked="layer.visible"
              @change="store.toggleLayer(layer.id)"
            />
            <span class="maps-layer-color" :style="{ background: layer.color }"></span>
            <span class="maps-layer-name">{{ layer.name }}</span>
          </label>
          <span class="maps-layer-z">Z:{{ layer.zIndex }}</span>
        </div>
      </div>

      <div class="maps-controls">
        <div class="maps-control-group">
          <label class="maps-control-label">Display Mode</label>
          <select
            class="maps-select"
            :value="store.gridDisplayMode"
            @change="store.setGridDisplayMode(($event.target as HTMLSelectElement).value as any)"
          >
            <option value="teletext">Teletext</option>
            <option value="mono">Mono</option>
            <option value="wireframe">Wireframe</option>
          </select>
        </div>

        <div class="maps-control-group">
          <label class="maps-control-label">Grid Size</label>
          <div class="maps-size-controls">
            <button class="maps-size-btn" @click="resizeGrid(-5, -5)">−</button>
            <span class="maps-size-label">{{ gridCols }}×{{ gridRows }}</span>
            <button class="maps-size-btn" @click="resizeGrid(5, 5)">+</button>
          </div>
        </div>

        <button class="maps-reset-btn" @click="resetGrid">Reset Grid</button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGridUIStore } from '../stores/gridUIStore'

const store = useGridUIStore()
const canvasRef = ref<HTMLDivElement | null>(null)

const gridCols = ref(40)
const gridRows = ref(24)

interface GridCellData {
  char: string
  color?: string
  bgColor?: string
}

const gridData = ref<GridCellData[][]>([])

function generateGrid(cols: number, rows: number): GridCellData[][] {
  const data: GridCellData[][] = []
  for (let y = 0; y < rows; y++) {
    const row: GridCellData[] = []
    for (let x = 0; x < cols; x++) {
      let char = '.'
      let color: string | undefined

      // Border
      if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
        if (y === 0 && x === 0) char = '╔'
        else if (y === 0 && x === cols - 1) char = '╗'
        else if (y === rows - 1 && x === 0) char = '╚'
        else if (y === rows - 1 && x === cols - 1) char = '╝'
        else if (y === 0 || y === rows - 1) char = '═'
        else char = '║'
        color = '#00FFFF'
      }
      // Grid lines
      else if (x % 5 === 0 && y % 5 === 0) {
        char = '┼'
        color = '#333333'
      }
      else if (x % 5 === 0) {
        char = '│'
        color = '#222222'
      }
      else if (y % 5 === 0) {
        char = '─'
        color = '#222222'
      }
      // Content zones
      else if (x > 5 && x < 15 && y > 3 && y < 8) {
        char = '█'
        color = '#00FF00'
      }
      else if (x > 25 && x < 35 && y > 12 && y < 18) {
        char = '▓'
        color = '#FFFF00'
      }
      else if (x > 10 && x < 20 && y > 15 && y < 20) {
        char = '▒'
        color = '#FF00FF'
      }

      row.push({ char, color })
    }
    data.push(row)
  }
  return data
}

function cellStyle(cell: GridCellData): Record<string, string> {
  const style: Record<string, string> = {}
  if (cell.color) style.color = cell.color
  if (cell.bgColor) style.background = cell.bgColor
  return style
}

function resizeGrid(deltaCols: number, deltaRows: number) {
  const newCols = Math.max(10, Math.min(80, gridCols.value + deltaCols))
  const newRows = Math.max(6, Math.min(48, gridRows.value + deltaRows))
  gridCols.value = newCols
  gridRows.value = newRows
  gridData.value = generateGrid(newCols, newRows)
}

function resetGrid() {
  gridCols.value = 40
  gridRows.value = 24
  gridData.value = generateGrid(40, 24)
}

onMounted(() => {
  gridData.value = generateGrid(gridCols.value, gridRows.value)
})
</script>

<style scoped>
.maps-panel {
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--gridui-bg);
  color: var(--gridui-text);
  font-family: 'Monaspace Krypton', 'JetBrains Mono', monospace;
  overflow: hidden;
}

.maps-canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 24px;
  background: #0A0A0A;
}

.maps-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #000;
  padding: 8px;
  border: 1px solid #333;
  border-radius: 4px;
}

.maps-row {
  display: flex;
  gap: 0;
}

.maps-cell {
  width: 14px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Teletext50', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1;
  color: #333;
  cursor: default;
  transition: color 0.1s;
}

.maps-cell:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1);
}

.maps-sidebar {
  width: 240px;
  min-width: 240px;
  border-left: 1px solid var(--gridui-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.maps-sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gridui-border);
  flex-shrink: 0;
}

.maps-sidebar-icon {
  color: var(--gridui-accent);
  font-size: 20px;
}

.maps-sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gridui-text);
}

.maps-layers {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.maps-layer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  margin-bottom: 4px;
  transition: background 0.15s;
}

.maps-layer:hover {
  background: rgba(255, 255, 255, 0.06);
}

.maps-layer--visible {
  opacity: 1;
}

.maps-layer:not(.maps-layer--visible) {
  opacity: 0.5;
}

.maps-layer-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  color: var(--gridui-text);
}

.maps-layer-toggle input[type="checkbox"] {
  accent-color: var(--gridui-accent);
}

.maps-layer-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.maps-layer-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.maps-layer-z {
  font-size: 10px;
  color: var(--gridui-text-subtle);
  font-family: 'Monaspace Krypton', monospace;
}

.maps-controls {
  padding: 12px 16px;
  border-top: 1px solid var(--gridui-border);
  flex-shrink: 0;
}

.maps-control-group {
  margin-bottom: 12px;
}

.maps-control-label {
  display: block;
  font-size: 11px;
  color: var(--gridui-text-muted);
  margin-bottom: 4px;
}

.maps-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--gridui-bg);
  color: var(--gridui-text);
  font-family: inherit;
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

.maps-select:focus {
  border-color: var(--gridui-accent);
}

.maps-size-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.maps-size-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--gridui-surface);
  color: var(--gridui-text);
  cursor: pointer;
  font-size: 16px;
  transition: background 0.15s;
}

.maps-size-btn:hover {
  background: var(--gridui-surface-elevated);
}

.maps-size-label {
  font-size: 13px;
  color: var(--gridui-text);
  min-width: 60px;
  text-align: center;
  font-family: 'Monaspace Krypton', monospace;
}

.maps-reset-btn {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--gridui-surface);
  color: var(--gridui-text);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  transition: background 0.15s;
}

.maps-reset-btn:hover {
  background: var(--gridui-surface-elevated);
}

.maps-canvas::-webkit-scrollbar,
.maps-layers::-webkit-scrollbar {
  width: 4px;
}

.maps-canvas::-webkit-scrollbar-track,
.maps-layers::-webkit-scrollbar-track {
  background: transparent;
}

.maps-canvas::-webkit-scrollbar-thumb,
.maps-layers::-webkit-scrollbar-thumb {
  background: var(--gridui-border);
  border-radius: 2px;
}
</style>
