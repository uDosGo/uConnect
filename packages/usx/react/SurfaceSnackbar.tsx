/* ═══════════════════════════════════════════════════════════════════
   @usx/react/surface — SurfaceSnackbar (mono unicode icons)
   Shared snackbar component for all USX surfaces.
   Uses unicode mono icons instead of Material Symbols for reliability.
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react'

export interface SnackbarMessage {
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  action?: string
}

export interface SurfaceSnackbarProps {
  snackbar: SnackbarMessage | null
  onDismiss: () => void
}

const snackbarIcons: Record<string, string> = {
  success: '\u2713',   // ✓
  error:   '\u2715',   // ✕
  warning: '\u26A0',   // ⚠
  info:    '\u2139',   // ℹ
}

export const SurfaceSnackbar: React.FC<SurfaceSnackbarProps> = ({ snackbar, onDismiss }) => {
  if (!snackbar) return null

  const icon = snackbarIcons[snackbar.type] || '\u2139'

  return (
    <div className={`usx-snackbar usx-snackbar--${snackbar.type}`}>
      <span className="usx-snackbar-icon">{icon}</span>
      <span className="usx-snackbar-text">{snackbar.message}</span>
      {snackbar.action && (
        <button className="usx-snackbar-action" onClick={onDismiss}>
          {snackbar.action}
        </button>
      )}
    </div>
  )
}
