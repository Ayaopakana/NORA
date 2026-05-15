'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import {
  dailyBudgetLabel,
  DAILY_BUDGET_LABELS,
} from '@/lib/daily-budget'
import { cn } from '@/lib/utils'

const ease = [0.25, 0.1, 0.25, 1] as const

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
  const prev = useRef(index)
  const direction = index > prev.current ? 1 : index < prev.current ? -1 : 0

  useEffect(() => {
    prev.current = index
  }, [index])

  return (
    <span
      className={cn(
        'relative inline-block min-h-[1.25rem] min-w-[6ch] overflow-hidden align-bottom',
        className,
      )}
      aria-live="polite"
      aria-atomic
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.span
          key={index}
          className="block truncate"
          initial={{ opacity: 0, y: direction * 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: direction * -6 }}
          transition={{ duration: 0.42, ease }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
