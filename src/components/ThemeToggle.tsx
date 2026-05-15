'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark'

  if (!mounted) {
    return (
      <span
        className={cn(
          'inline-flex h-11 w-11 shrink-0 rounded-xl border border-[var(--nora-border)] glass-panel',
          className,
        )}
        aria-hidden
      />
    )
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--nora-border)] glass-panel shadow-none',
        className,
      )}
      aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
