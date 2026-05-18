'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import {
  dailyBudgetLabel,
  DAILY_BUDGET_LABELS,
} from '@/lib/daily-budget'
import { motionGpuClass, tween } from '@/lib/motion'
import { cn } from '@/lib/utils'

function widestLabel(labels: readonly string[]) {
  return labels.reduce(
    (widest, next) => (next.length > widest.length ? next : widest),
    labels[0] ?? '',
  )
}

type DailyBudgetLabelProps = {
  index: number
  className?: string
  labels?: readonly string[]
}

export function DailyBudgetLabel({
  index,
  className,
  labels = DAILY_BUDGET_LABELS,
}: DailyBudgetLabelProps) {
  const label =
    labels[Math.max(0, Math.min(labels.length - 1, Math.round(index)))] ??
    dailyBudgetLabel(index)
  const reserveLabel = useMemo(() => widestLabel(labels), [labels])
  const prev = useRef(index)
  const direction = index > prev.current ? 1 : index < prev.current ? -1 : 0

  useEffect(() => {
    prev.current = index
  }, [index])

  return (
    <span
      className={cn('relative block overflow-hidden', className)}
      aria-live="polite"
      aria-atomic
    >
      <span
        className="block truncate text-transparent select-none"
        aria-hidden
      >
        {reserveLabel}
      </span>
      <span className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="sync" initial={false}>
          <motion.span
            key={index}
            className={cn(
              'absolute inset-x-0 top-0 block truncate motion-gpu',
              motionGpuClass,
            )}
            initial={{ opacity: 0, y: direction * 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction * -5 }}
            transition={tween.enter}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
