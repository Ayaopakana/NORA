'use client'

import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/lib/utils'

type BirthDateFieldsProps = {
  day: string
  month: string
  year: string
  onDayChange: (v: string) => void
  onMonthChange: (v: string) => void
  onYearChange: (v: string) => void
  className?: string
  inputClassName?: string
}

export function BirthDateFields({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  className,
  inputClassName,
}: BirthDateFieldsProps) {
  const { t } = useI18n()
  const maxYear = new Date().getFullYear()
  const inputCls = cn('glass-input h-12 w-full px-3 text-sm', inputClassName)

  return (
    <div className={cn('space-y-1.5', className)}>
      <p className="text-sm font-medium text-[var(--nora-text)]">
        {t('birthDate.label')}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--nora-text-muted)]">
            {t('birthDate.day')}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            className={inputCls}
            value={day}
            onChange={(e) => onDayChange(e.target.value)}
            placeholder="15"
            aria-label={t('birthDate.day')}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--nora-text-muted)]">
            {t('birthDate.month')}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={12}
            className={inputCls}
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            placeholder="6"
            aria-label={t('birthDate.month')}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--nora-text-muted)]">
            {t('birthDate.year')}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1920}
            max={maxYear}
            className={inputCls}
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            placeholder="2000"
            aria-label={t('birthDate.year')}
          />
        </label>
      </div>
      <p className="text-[11px] text-[var(--nora-text-muted)]">{t('birthDate.hint')}</p>
    </div>
  )
}
