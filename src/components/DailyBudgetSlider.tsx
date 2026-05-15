'use client'

import { DailyBudgetLabel } from '@/components/DailyBudgetLabel'
import { BudgetStepSlider } from '@/components/BudgetStepSlider'
import { cn } from '@/lib/utils'

type DailyBudgetSliderProps = {
  value: number
  onValueChange: (index: number) => void
  className?: string
  labelClassName?: string
  sliderClassName?: string
  labels?: readonly string[]
}

export function DailyBudgetSlider({
  value,
  onValueChange,
  className,
  labelClassName,
  sliderClassName,
  labels,
}: DailyBudgetSliderProps) {
  return (
    <div className={className}>
      <DailyBudgetLabel
        index={value}
        className={labelClassName}
        labels={labels}
      />
      <BudgetStepSlider
        value={value}
        onValueChange={onValueChange}
        tickLabels={labels}
        className={cn('mt-2', sliderClassName)}
      />
    </div>
  )
}
