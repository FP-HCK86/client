import React from 'react'
import LoadingSpinner from './LoadingSpinner'

export default function FullPageLoader({ text = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner sizeVariant="lg" speed="0.9s" thickness={8} className="" aria-label="Loading" />
        <span className="text-sm text-slate-700 dark:text-slate-200">{text}</span>
      </div>
    </div>
  )
}
