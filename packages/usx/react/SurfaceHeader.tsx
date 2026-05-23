/* ═══════════════════════════════════════════════════════════════════
   @usx/react/surface — SurfaceHeader
   Shared header component for all USX surfaces.
   Provides: home button, title, badge, palette cycle, font controls, chat toggle, theme toggle
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react'
import { Icon } from './Icon'

export interface SurfaceHeaderProps {
  /** Surface title (e.g. "gridui", "code3ui") */
  title: string
  /** Badge text (e.g. "USX v1.0", "Jotion Workspace") */
  badge?: string
  /** Current palette ID for swatch dot */
  currentPalette: string
  /** Palette swatch colors map */
  paletteColors: Record<string, string>
  /** Called when palette dot is clicked */
  onCyclePalette: () => void
  /** Current font size in px */
  fontSize: number
  /** Called to decrease font size */
  onDecreaseFont: () => void
  /** Called to increase font size */
  onIncreaseFont: () => void
  /** Current font style */
  fontStyle: string
  /** Called to cycle font style */
  onCycleFontStyle: () => void
  /** Whether chat is open */
  chatOpen: boolean
  /** Called to toggle chat */
  onToggleChat: () => void
  /** Whether dark mode is active */
  isDark: boolean
  /** Called to toggle theme */
  onToggleTheme: () => void
  /** Optional breadcrumb items */
  breadcrumb?: { label: string; current?: boolean }[]
  /** Optional home URL (defaults to http://localhost:5176) */
  homeUrl?: string
}

const FONT_STYLE_ICONS: Record<string, string> = {
  serif: 'format_italic',
  sans: 'text_fields',
  mono: 'code',
}

export const SurfaceHeader: React.FC<SurfaceHeaderProps> = ({
  title,
  badge,
  currentPalette,
  paletteColors,
  onCyclePalette,
  fontSize,
  onDecreaseFont,
  onIncreaseFont,
  fontStyle,
  onCycleFontStyle,
  chatOpen,
  onToggleChat,
  isDark,
  onToggleTheme,
  breadcrumb,
  homeUrl = 'http://localhost:5176',
}) => {
  const swatchColor = paletteColors[currentPalette] || '#cccccc'

  return (
    <header className="usx-surface-header">
      <div className="usx-header-left">
        <a
          href={homeUrl}
          className="usx-header-btn"
          title="Back to UI Hub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="home" size={18} />
        </a>
        <div className="usx-header-divider" />
        <h1 className="usx-header-title">{title}</h1>
        {badge && <span className="usx-header-badge">{badge}</span>}
        {breadcrumb && (
          <>
            <div className="usx-header-divider" />
            <div className="usx-header-breadcrumb">
              {breadcrumb.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="usx-breadcrumb-sep">/</span>}
                  <span className={`usx-breadcrumb-item ${item.current ? 'usx-breadcrumb-current' : ''}`}>
                    {item.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="usx-header-right">
        {/* Palette swatch dot */}
        <button
          className="usx-header-btn usx-palette-btn"
          onClick={onCyclePalette}
          title={`Palette: ${currentPalette}`}
        >
          <span
            className="usx-swatch-dot"
            style={{ backgroundColor: swatchColor }}
          />
        </button>

        <div className="usx-header-divider" />

        {/* Font size controls */}
        <button className="usx-header-btn" onClick={onDecreaseFont} title="Decrease font size">
          <Icon name="text_decrease" size={16} />
        </button>
        <span className="usx-header-fontsize">{fontSize}</span>
        <button className="usx-header-btn" onClick={onIncreaseFont} title="Increase font size">
          <Icon name="text_increase" size={16} />
        </button>

        <div className="usx-header-divider" />

        {/* Font style cycle */}
        <button className="usx-header-btn" onClick={onCycleFontStyle} title={`Font: ${fontStyle}`}>
          <Icon name={FONT_STYLE_ICONS[fontStyle] || 'text_fields'} size={16} />
        </button>

        <div className="usx-header-divider" />

        {/* Chat toggle */}
        <button className="usx-header-btn" onClick={onToggleChat} title={chatOpen ? 'Close chat' : 'Open chat'}>
          <Icon name="chat" size={18} />
        </button>

        {/* Theme toggle */}
        <button className="usx-header-btn" onClick={onToggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
          <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={18} />
        </button>
      </div>
    </header>
  )
}
