'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type SwitchProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'role'
> & {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      ref={ref}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 rounded-full border transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--nora-accent)_50%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nora-bg-base)]',
        checked
          ? 'border-sky-400/50 bg-sky-500/35'
          : 'border-[var(--nora-border-strong)] bg-[var(--nora-surface)]',
        disabled && 'cursor-not-allowed opacity-45',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200',
          'dark:bg-slate-100',
          checked ? 'translate-x-[1.35rem]' : 'translate-x-0.5',
        )}
      />
    </button>
  ),
)
Switch.displayName = 'Switch'
