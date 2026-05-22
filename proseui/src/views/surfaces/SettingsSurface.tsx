/* ═══════════════════════════════════════════════════════════════════
   SettingsSurface — Font, theme, and scheme settings
   Ported from Vue SettingsSurface.vue + FontSettings.vue
   ═══════════════════════════════════════════════════════════════════ */
import React, { useEffect, useState } from 'react'
import { Icon } from '@usx/styles/react/icon'
import { useProseUIStore } from './proseui/stores/proseUIStore'

type FontStyleOption = { id: string; label: string; icon: string; description: string }

const FONT_STYLES: FontStyleOption[] = [
  { id: 'sans', label: 'Sans', icon: 'Aa', description: 'Clean sans-serif' },
  { id: 'serif', label: 'Serif', icon: 'Aa', description: 'Classic serif' },
  { id: 'mono', label: 'Mono', icon: 'Aa', description: 'Monospace' },
]

const SIZE_LEVELS = [14, 16, 18, 20, 24]

const SettingsSurface: React.FC = () => {
  const store = useProseUIStore()
  const [currentSizeIndex, setCurrentSizeIndex] = useState(() => {
    const idx = SIZE_LEVELS.indexOf(store.fontSize)
    return idx >= 0 ? idx : 1
  })

  const increaseSize = () => {
    if (currentSizeIndex < SIZE_LEVELS.length - 1) {
      const next = currentSizeIndex + 1
      setCurrentSizeIndex(next)
      store.increaseFont()
    }
  }

  const decreaseSize = () => {
    if (currentSizeIndex > 0) {
      const prev = currentSizeIndex - 1
      setCurrentSizeIndex(prev)
      store.decreaseFont()
    }
  }

  const resetSize = () => {
    setCurrentSizeIndex(1)
    store.setFontSize(16)
  }

  return (
    <div className="settings-surface">
      <div className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <p className="settings-subtitle">Configure your uDos experience</p>
      </div>

      {/* ─── Typography Settings ─── */}
      <div className="settings-section">
        <h3 className="settings-section-title">Typography Settings</h3>
        <p className="settings-caption">Choose a font style and adjust text size. Changes apply across all surfaces.</p>

        {/* Font Style Toggle */}
        <div className="settings-field">
          <label className="settings-label">Font Style</label>
          <div className="style-grid">
            {FONT_STYLES.map(style => (
              <button key={style.id}
                      className={`style-btn ${store.fontStyle === style.id ? 'active' : ''}`}
                      onClick={() => store.setFontStyle(style.id as any)}
                      title={style.description}>
                <span className="style-icon">{style.icon}</span>
                <span className="style-label">{style.label}</span>
              </button>
            ))}
          </div>
          <p className="settings-caption">Changes the font family across body, heading, UI, and monospace roles</p>
        </div>

        {/* Font Size Zoom */}
        <div className="settings-field">
          <label className="settings-label">Text Size</label>
          <div className="zoom-controls">
            <button onClick={decreaseSize}
                    className="zoom-btn"
                    disabled={currentSizeIndex === 0}
                    aria-label="Decrease font size">
              <span className="zoom-icon">−</span>
            </button>
            <div className="size-indicator">
              <span className="size-label" style={{ fontSize: `${SIZE_LEVELS[currentSizeIndex]}px` }}>Aa</span>
              <span className="size-value">{SIZE_LEVELS[currentSizeIndex]}px</span>
            </div>
            <button onClick={increaseSize}
                    className="zoom-btn"
                    disabled={currentSizeIndex === SIZE_LEVELS.length - 1}
                    aria-label="Increase font size">
              <span className="zoom-icon">+</span>
            </button>
            <button onClick={resetSize} className="zoom-btn reset-btn" aria-label="Reset font size">
              <span className="zoom-icon">↺</span>
            </button>
          </div>
          <p className="settings-caption">Use +/− to zoom, reset to return to default (16px)</p>
        </div>

        {/* Preview */}
        <div className="settings-field">
          <label className="settings-label">Preview</label>
          <div className="preview-box">
            <h1 className="preview-h1">Heading Preview</h1>
            <p className="preview-body">
              The quick brown fox jumps over the lazy dog. This preview shows how text will appear across all USX surfaces.
            </p>
            <code className="preview-code">console.log('Code preview');</code>
            <div className="preview-ui">
              <button className="preview-btn">Button</button>
              <span className="preview-caption">Caption text</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Theme Settings ─── */}
      <div className="settings-section">
        <h3 className="settings-section-title">Theme Settings</h3>
        <p className="settings-caption">Choose a colour scheme and toggle between light and dark mode.</p>

        <div className="settings-field">
          <label className="settings-label">Colour Scheme</label>
          <div className="scheme-grid">
            {store.schemes.map(s => (
              <button key={s.id}
                      className={`scheme-btn ${store.scheme.id === s.id ? 'active' : ''}`}
                      onClick={() => store.setScheme(s)}>
                <div className="scheme-swatches">
                  <span className="scheme-swatch" style={{ background: s.light.background }} />
                  <span className="scheme-swatch" style={{ background: s.light.primary }} />
                  <span className="scheme-swatch" style={{ background: s.dark.background }} />
                  <span className="scheme-swatch" style={{ background: s.dark.primary }} />
                </div>
                <span className="scheme-label">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Mode</label>
          <div className="mode-toggle">
            <button className={`mode-btn ${store.themeMode === 'light' ? 'active' : ''}`}
                    onClick={() => { if (store.themeMode !== 'light') store.toggleTheme() }}>
              <Icon name="light_mode" size={16} />
              Light
            </button>
            <button className={`mode-btn ${store.themeMode === 'dark' ? 'active' : ''}`}
                    onClick={() => { if (store.themeMode !== 'dark') store.toggleTheme() }}>
              <Icon name="dark_mode" size={16} />
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsSurface
