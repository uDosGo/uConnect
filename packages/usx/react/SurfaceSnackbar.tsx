/* ═══════════════════════════════════════════════════════════════════
   @usx/react/surface — SurfaceSnackbar
   Shared snackbar component for all USX surfaces.
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

export const SurfaceSnackbar: React.FC<SurfaceSnackbarProps> = ({ snackbar, onDismiss }) => {
  if (!snackbar) return null

  return (
    <div className={`usx-snackbar usx-snackbar--${snackbar.type}`}>
      <span>{snackbar.message}</span>
      {snackbar.action && (
        <button className="usx-snackbar-action" onClick={onDismiss}>
          {snackbar.action}
        </button>
      )}
    </div>
  )
}
