'use client'

import { Coins, Clock, MapPin, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { BudgetStepSlider } from '@/components/BudgetStepSlider'
import { DailyBudgetLabel } from '@/components/DailyBudgetLabel'
import { MAP_MOODS } from '@/components/map/map-moods'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/useAuth'
import { useI18n } from '@/hooks/useI18n'
import {
  buildDayRoute,
  type DayRoute,
  type RouteTimeSlot,
} from '@/lib/build-day-route'
import { getDailyBudgetLabels } from '@/lib/daily-budget'
import {
  getPlannerMoodMeta,
  normalizePlannerMood,
  type PlannerMood,
} from '@/lib/planner-recommendations'
import type { MbtiId } from '@/lib/mbti'
import type { MoodPreset } from '@/types/user'
import { cn } from '@/lib/utils'

const TIME_SLOTS: RouteTimeSlot[] = ['morning', 'afternoon', 'evening', 'full']

const AREA_PRESETS = ['центр', 'Ош', 'парк', 'кафе'] as const

type RouteBuilderFormProps = {
  mood: MoodPreset
  budgetIdx: number
  mbti: MbtiId | ''
  onMoodChange: (mood: MoodPreset) => void
  onBudgetChange: (idx: number) => void
  onBuilt: (route: DayRoute) => void
}

export function RouteBuilderForm({
  mood,
  budgetIdx,
  mbti,
  onMoodChange,
  onBudgetChange,
  onBuilt,
}: RouteBuilderFormProps) {
  const { user } = useAuth()
  const { locale, t } = useI18n()
  const [timeSlot, setTimeSlot] = useState<RouteTimeSlot>('afternoon')
  const [area, setArea] = useState('')
  const [error, setError] = useState<string | null>(null)

  const moodMeta = getPlannerMoodMeta(locale)
  const budgetLabels = getDailyBudgetLabels(locale)
  const plannerMood = normalizePlannerMood(mood)

  const timeLabels: Record<RouteTimeSlot, string> = {
    morning: t('routeBuilder.timeMorning'),
    afternoon: t('routeBuilder.timeAfternoon'),
    evening: t('routeBuilder.timeEvening'),
    full: t('routeBuilder.timeFull'),
  }

  function handleBuild() {
    const route = buildDayRoute(
      { mood, budgetIdx, timeSlot, area, mbti, birthYear: user?.birthYear ?? null },
      locale,
    )
    if (!route) {
      setError(t('routeBuilder.noStops'))
      return
    }
    setError(null)
    onBuilt(route)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3 pt-2">
      <div className="border-b border-[var(--nora-border-subtle)] pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-500 dark:text-sky-400">
          {t('routeBuilder.title')}
        </p>
        <p className="mt-0.5 text-xs text-[var(--nora-text-muted)]">
          {t('routeBuilder.subtitle')}
        </p>
      </div>

      <section className="mt-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--nora-text-muted)]">
          {t('planner.state')}
        </p>
        <ul className="grid grid-cols-2 gap-1.5">
          {MAP_MOODS.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onMoodChange(m.id)}
                className={cn(
                  'flex w-full flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-center transition-colors',
                  mood === m.id
                    ? cn('border-sky-400/55 bg-sky-400/12 ring-2', m.ring)
                    : 'border-[var(--nora-border-subtle)] bg-[var(--nora-surface-veil)] hover:border-sky-400/30',
                )}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {m.emoji}
                </span>
                <span className="text-[10px] font-medium leading-tight text-[var(--nora-text)]">
                  {moodMeta[m.id as PlannerMood].label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-3 rounded-xl border border-[var(--nora-border-subtle)] bg-[var(--nora-surface-veil)] p-2.5">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400" aria-hidden />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nora-text-muted)]">
            {t('budget.title')}
          </p>
        </div>
        <DailyBudgetLabel
          index={budgetIdx}
          labels={budgetLabels}
          className="mt-1.5 block w-full text-xs font-medium text-[var(--nora-text)]"
        />
        <BudgetStepSlider
          className="mt-2"
          value={budgetIdx}
          onValueChange={onBudgetChange}
        />
      </section>

      <section className="mt-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" aria-hidden />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nora-text-muted)]">
            {t('routeBuilder.time')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setTimeSlot(slot)}
              className={cn(
                'rounded-xl border px-2 py-2 text-[11px] font-medium transition-colors',
                timeSlot === slot
                  ? 'border-sky-400/55 bg-sky-400/12 text-sky-700 dark:text-sky-200'
                  : 'border-[var(--nora-border-subtle)] bg-[var(--nora-surface-veil)] text-[var(--nora-text-muted)] hover:border-sky-400/30',
              )}
            >
              {timeLabels[slot]}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" aria-hidden />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nora-text-muted)]">
            {t('routeBuilder.area')}
          </p>
        </div>
        <input
          type="text"
          value={area}
          onChange={(e) => {
            setArea(e.target.value)
            setError(null)
          }}
          placeholder={t('routeBuilder.areaPlaceholder')}
          className="glass-input w-full px-3 py-2.5 text-sm"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {AREA_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setArea(preset)
                setError(null)
              }}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] transition-colors',
                area.toLowerCase() === preset.toLowerCase()
                  ? 'border-sky-400/55 bg-sky-400/12 text-sky-700 dark:text-sky-200'
                  : 'border-[var(--nora-border-subtle)] text-[var(--nora-text-muted)] hover:border-sky-400/30',
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      </section>

      {mbti ? (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-[var(--nora-text-muted)]">
          <Sparkles className="h-3 w-3 text-sky-400" aria-hidden />
          {t('routeBuilder.mbtiHint', { mbti })}
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-300">
          {error}
        </p>
      ) : null}

      <Button type="button" className="mt-4 w-full gap-2" onClick={handleBuild}>
        <Sparkles className="h-4 w-4" aria-hidden />
        {t('routeBuilder.build')}
      </Button>

      <p className="mt-2 text-center text-[10px] text-[var(--nora-text-muted)]">
        {moodMeta[plannerMood].hint}
      </p>
    </div>
  )
}
