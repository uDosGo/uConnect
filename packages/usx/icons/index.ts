/* ═══════════════════════════════════════════════════════════════════
   @usx/icons — Material Symbols Icon Component
   Loaded via Google Fonts CDN
   ═══════════════════════════════════════════════════════════════════ */

import React from 'react';

export interface USXIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: -25 | 0 | 200;
  opticalSize?: 20 | 24 | 40 | 48;
  onClick?: () => void;
}

/**
 * USXIcon — Material Symbols icon component.
 *
 * Usage:
 *   <USXIcon name="settings" />
 *   <USXIcon name="dark_mode" size={32} filled />
 *   <USXIcon name="delete" color="var(--usx-color-error)" />
 *
 * Requires the Material Symbols font to be loaded (see index.css or add to HTML):
 *   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
 */
export const USXIcon: React.FC<USXIconProps> = ({
  name,
  size = 24,
  color,
  className = '',
  filled = false,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  onClick,
}) => {
  const style: React.CSSProperties = {
    fontSize: size,
    color,
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
    cursor: onClick ? 'pointer' : undefined,
  };

  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={name.replace(/_/g, ' ')}
    >
      {name}
    </span>
  );
};

export default USXIcon;
