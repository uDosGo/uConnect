/* ═══════════════════════════════════════════════════════════════════
   @usx/react/button — USX Button Component
   Extracted from UniversalSurfaceXD
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'medium',
  icon,
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    'ui-button',
    `ui-button-${variant}`,
    `ui-button-${size}`,
    fullWidth ? 'ui-button-full' : '',
    loading ? 'ui-button-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="ui-spinner ui-spinner-small">⟳</span>
      ) : icon ? (
        <span className="ui-button-icon">{icon}</span>
      ) : null}
      {children && <span className="ui-button-label">{children}</span>}
    </button>
  );
}

interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  className = '',
}: ButtonGroupProps) {
  return (
    <div className={`ui-button-group ui-button-group-${orientation} ${className}`}>
      {children}
    </div>
  );
}
