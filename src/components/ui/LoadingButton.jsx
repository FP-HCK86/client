import React from 'react'
import { Button } from '@/components/ui/button'
import LoadingSpinner from './LoadingSpinner'

/**
 * LoadingButton
 * Props:
 * - loading: boolean
 * - sizeVariant: 'sm'|'md'|'lg'
 * - spinnerProps: { sizeVariant, speed, thickness }
 * - rest forwarded to underlying Button
 */
export default function LoadingButton({ loading = false, sizeVariant = 'md', spinnerProps = {}, children, className = '', ...props }) {
  const disabled = !!loading || !!props.disabled

  return (
    <Button
      {...props}
      disabled={disabled}
      aria-busy={loading}
      aria-disabled={disabled}
      className={className}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? (
          <>
            <LoadingSpinner sizeVariant={spinnerProps.sizeVariant || 'sm'} speed={spinnerProps.speed || '0.9s'} thickness={spinnerProps.thickness || 3} />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </span>
    </Button>
  )
}
