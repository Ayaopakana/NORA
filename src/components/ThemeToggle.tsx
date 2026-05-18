'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { buttonVariants } from '@/components/ui/button'
import { transitionTheme } from '@/lib/theme-view-transition'
import { mapAppearanceScheme } from '@/lib/map-appearance'
import { useI18n } from '@/hooks/useI18n'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const reduceMotion = useReducedMotion()

  React.useEffect(() => setMounted(true), [])

  const displayScheme = mapAppearanceScheme(theme, resolvedTheme)
  const isDark = displayScheme === 'dark'

  if (!mounted) {
    return (
      <span
        className={cn(
          'inline-flex h-11 w-11 shrink-0 rounded-glass glass-panel shadow-glass',
          className,
        )}
        aria-hidden
      />
    )
  }

  return (
    <motion.button
      type="button"
      className={cn(
        buttonVariants({ variant: 'secondary', size: 'icon' }),
        'relative h-11 w-11 shrink-0 overflow-hidden rounded-glass shadow-glass',
        className,
      )}
      aria-label={isDark ? t('theme.light') : t('theme.dark')}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      transition={spring.snappy}
      onClick={() => transitionTheme(isDark ? 'light' : 'dark', setTheme)}
    >
      <span className="pointer-events-none relative flex h-full w-full items-center justify-center">
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            rotate: isDark ? -70 : 0,
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
          }}
          transition={reduceMotion ? { duration: 0 } : spring.smooth}
        >
          <Sun className="h-[1.1rem] w-[1.1rem]" aria-hidden />
        </motion.span>
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            rotate: isDark ? 0 : 70,
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
          }}
          transition={reduceMotion ? { duration: 0 } : spring.smooth}
        >
          <Moon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
        </motion.span>
      </span>
    </motion.button>
  )
}
