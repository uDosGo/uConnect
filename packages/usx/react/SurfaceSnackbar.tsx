/* ═══════════════════════════════════════════════════════════════════
   @usx/react/surface — SurfaceSnackbar (M3-style)
   Shared snackbar component for all USX surfaces.
   Uses Material Symbols icons with color-coded type indicators.
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
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
}

export const SurfaceSnackbar: React.FC<SurfaceSnackbarProps> = ({ snackbar, onDismiss }) => {
  if (!snackbar) return null

  const icon = snackbarIcons[snackbar.type] || 'info'

  return (
    <div className={`usx-snackbar usx-snackbar--${snackbar.type}`}>
      <span className="usx-snackbar-icon material-symbols-outlined">{icon}</span>
      <span className="usx-snackbar-text">{snackbar.message}</span>
      {snackbar.action && (
        <button className="usx-snackbar-action" onClick={onDismiss}>
          {snackbar.action}
        </button>
      )}
    </div>
  )
}
