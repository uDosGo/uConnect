/* ═══════════════════════════════════════════════════════════════════
   PlaceholderSurface — Generic placeholder for surfaces not yet
   ported from the Vue UDOUI archive.
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react'
import { Icon } from '@usx/styles/react/icon'

interface Props {
  title: string
  icon?: string
  description?: string
}

const PlaceholderSurface: React.FC<Props> = ({ title, icon = 'widgets', description }) => (
  <div className="placeholder-surface">
    <div className="placeholder-surface-inner">
      <Icon name={icon} size={48} />
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <p className="placeholder-surface-note">This surface is coming soon.</p>
    </div>
  </div>
)

export default PlaceholderSurface
