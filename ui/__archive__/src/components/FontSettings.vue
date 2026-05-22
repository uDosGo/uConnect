<template>
  <div class="font-settings">
    <h3 class="udoui-h3">Typography Settings</h3>
    <p class="udoui-caption">Choose a font style and adjust text size. Changes apply across all surfaces.</p>

    <!-- Font Style Toggle -->
    <div class="settings-section">
      <label class="udoui-label-text">Font Style</label>
      <div class="style-grid">
        <button
          v-for="style in fontStyles"
          :key="style.id"
          class="style-btn"
          :class="{ active: currentStyle === style.id }"
          @click="setFontStyle(style.id)"
          :title="style.description"
        >
          <span class="style-icon">{{ style.icon }}</span>
          <span class="style-label">{{ style.label }}</span>
        </button>
      </div>
      <p class="udoui-caption">Changes the font family across body, heading, UI, and monospace roles</p>
    </div>

    <!-- Font Size Zoom -->
    <div class="settings-section">
      <label class="udoui-label-text">Text Size</label>
      <div class="zoom-controls">
        <button
          @click="decreaseSize"
          class="zoom-btn"
          :disabled="currentSizeIndex === 0"
          aria-label="Decrease font size"
        >
          <span class="zoom-icon">−</span>
        </button>
        <div class="size-indicator">
          <span
            class="size-label"
            :style="{ fontSize: fontSizePx + 'px' }"
          >Aa</span>
          <span class="size-value">{{ fontSizePx }}px</span>
        </div>
        <button
          @click="increaseSize"
          class="zoom-btn"
          :disabled="currentSizeIndex === sizeLevels.length - 1"
          aria-label="Increase font size"
        >
          <span class="zoom-icon">+</span>
        </button>
        <button @click="resetSize" class="zoom-btn reset-btn" aria-label="Reset font size">
          <span class="zoom-icon">↺</span>
        </button>
      </div>
      <p class="udoui-caption">Use +/− to zoom, reset to return to default (16px)</p>
    </div>

    <!-- Preview -->
    <div class="settings-section">
      <label class="udoui-label-text">Preview</label>
      <div class="preview-box">
        <h1 class="preview-h1">Heading Preview</h1>
        <p class="preview-body">
          The quick brown fox jumps over the lazy dog. This preview shows how text will appear across all USX surfaces.
        </p>
        <code class="preview-code">console.log('Code preview');</code>
        <div class="preview-ui">
          <button class="preview-btn">Button</button>
          <span class="preview-caption">Caption text</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type FontStyle = 'default' | 'serif' | 'compact' | 'teletext' | 'retro' | 'c64'

interface FontStyleOption {
  id: FontStyle
  label: string
  icon: string
  description: string
}

const fontStyles: FontStyleOption[] = [
  { id: 'default', label: 'Default', icon: 'Aa', description: 'Clean sans-serif' },
  { id: 'serif', label: 'Serif', icon: 'Aa', description: 'Classic serif' },
  { id: 'compact', label: 'Compact', icon: 'Aa', description: 'Tighter spacing' },
  { id: 'teletext', label: 'Teletext', icon: '📺', description: 'Grid-based teletext' },
  { id: 'retro', label: 'Retro', icon: '🎮', description: 'Pixel font' },
  { id: 'c64', label: 'C64', icon: '🖥️', description: 'Commodore 64 style' },
]

const sizeLevels = ['small', 'medium', 'large', 'xlarge', 'xxlarge'] as const
const sizePxMap: Record<string, number> = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
}

const currentStyle = ref<FontStyle>('default')
const currentSize = ref<string>('medium')
const currentSizeIndex = computed(() => sizeLevels.indexOf(currentSize.value as typeof sizeLevels[number]))
const fontSizePx = computed(() => sizePxMap[currentSize.value] || 16)

function setFontStyle(style: FontStyle) {
  currentStyle.value = style
  document.documentElement.setAttribute('data-font-style', style)
  localStorage.setItem('usx-font-style', style)
  window.dispatchEvent(new CustomEvent('font-style-change', { detail: { style } }))
}

function increaseSize() {
  const idx = currentSizeIndex.value
  if (idx < sizeLevels.length - 1) {
    applySize(sizeLevels[idx + 1])
  }
}

function decreaseSize() {
  const idx = currentSizeIndex.value
  if (idx > 0) {
    applySize(sizeLevels[idx - 1])
  }
}

function resetSize() {
  applySize('medium')
}

function applySize(size: string) {
  currentSize.value = size
  document.documentElement.setAttribute('data-font-size', size)
  localStorage.setItem('usx-font-size', size)
  window.dispatchEvent(new CustomEvent('font-size-change', { detail: { size, px: sizePxMap[size] || 16 } }))
}

onMounted(() => {
  // Load saved font style
  const savedStyle = localStorage.getItem('usx-font-style') as FontStyle | null
  if (savedStyle && fontStyles.some(s => s.id === savedStyle)) {
    currentStyle.value = savedStyle
    document.documentElement.setAttribute('data-font-style', savedStyle)
  }

  // Load saved font size
  const savedSize = localStorage.getItem('usx-font-size')
  if (savedSize && sizeLevels.includes(savedSize as typeof sizeLevels[number])) {
    currentSize.value = savedSize
    document.documentElement.setAttribute('data-font-size', savedSize)
  }
})
</script>

<style scoped>
.font-settings {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.settings-section {
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}

.settings-section:first-of-type {
  margin-top: 1rem;
}

/* ─── Font Style Grid ─────────────────────────────────────────── */
.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.style-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.75rem 0.5rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.style-btn:hover {
  border-color: #60a5fa;
  color: #e2e8f0;
  background: #1e293b;
}

.style-btn.active {
  border-color: #3b82f6;
  background: #1e3a5f;
  color: #60a5fa;
}

.style-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.style-label {
  font-size: 0.75rem;
  font-weight: 500;
}

/* ─── Zoom Controls ───────────────────────────────────────────── */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 1rem;
}

.zoom-btn:hover:not(:disabled) {
  border-color: #60a5fa;
  color: #e2e8f0;
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-btn.reset-btn {
  margin-left: 0.5rem;
}

.zoom-icon {
  line-height: 1;
}

.size-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  min-width: 60px;
}

.size-label {
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1;
  transition: font-size 0.2s ease;
}

.size-value {
  font-size: 0.7rem;
  color: #64748b;
  font-family: monospace;
}

/* ─── Preview ─────────────────────────────────────────────────── */
.preview-box {
  margin-top: 0.75rem;
  padding: 1.25rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
}

.preview-h1 {
  font-family: var(--usx-font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.75rem;
  line-height: 1.25;
}

.preview-body {
  font-family: var(--usx-font-body);
  font-size: 1rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.preview-code {
  display: block;
  font-family: var(--usx-font-mono);
  font-size: 0.85rem;
  background: #1e293b;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  color: #60a5fa;
  margin-bottom: 0.75rem;
}

.preview-ui {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-btn {
  font-family: var(--usx-font-ui);
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.preview-caption {
  font-family: var(--usx-font-caption);
  font-size: 0.75rem;
  color: #64748b;
}
</style>
