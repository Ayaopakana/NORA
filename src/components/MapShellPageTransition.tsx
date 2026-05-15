'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

const ease = [0.25, 0.1, 0.25, 1] as const

export function MapShellPageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className="relative min-h-0 w-full flex-1">{children}</div>
  }

  return (
    <div className="relative min-h-0 w-full flex-1 overflow-hidden">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          className="absolute inset-0 overflow-x-hidden overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.48, ease }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
