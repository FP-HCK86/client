import React from 'react'

/**
 * LoadingSpinner
 * Props:
 *  - sizeVariant: 'sm' | 'md' | 'lg' (defaults to 'md')
 *  - speed: CSS time string override for rotation (e.g. '0.8s')
 *  - thickness: numeric px override for ring thickness
 *  - className: additional classes
 */
export default function LoadingSpinner({ sizeVariant = 'md', speed, thickness, color, className = '' }) {
  const sizeClass = sizeVariant === 'sm' ? 'custom-spinner-sm' : sizeVariant === 'lg' ? 'custom-spinner-lg' : 'custom-spinner-md'

  const style = {}
  if (speed) style['--spinner-speed'] = speed
  if (thickness) style['--spinner-thickness'] = `${thickness}px`
  if (color) style['--spinner-color'] = color

  return (
    <span
      role="status"
      aria-live="polite"
      className={`custom-spinner ${sizeClass} ${className}`}
      style={style}
    />
  )
}
