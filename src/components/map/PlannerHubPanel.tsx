'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Coins, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MbtiHelpDialog } from '@/components/MbtiHelpDialog'
import { PlannerRecommendationsList } from '@/components/planner/PlannerRecommendationsList'
import { DailyBudgetLabel } from '@/components/DailyBudgetLabel'
import { BudgetStepSlider } from '@/components/BudgetStepSlider'
import { MAP_MOODS } from '@/components/map/map-moods'
import { useI18n } from '@/hooks/useI18n'
import { getDailyBudgetLabels } from '@/lib/daily-budget'
import { MBTI_TYPES } from '@/lib/mbti'
import {
  getPlannerMoodMeta,
  normalizePlannerMood,
  type PlannerMood,
  type PlannerRecommendation,
} from '@/lib/planner-recommendations'
import type { MbtiId } from '@/lib/mbti'
import type { MoodPreset } from '@/types/user'
import { cn } from '@/lib/utils'

type PlannerHubPanelProps = {
  mood: MoodPreset
  onMoodChange: (mood: MoodPreset) => void
  budgetIdx: number
  onBudgetChange: (idx: number) => void
  mbti: MbtiId | ''
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSelectPlace?: (place: PlannerRecommendation) => void
}

/** Кнопка — нижняя часть верхней половины; панель тянется до навбара */
const PLANNER_TOP =
  'top-[max(4.5rem,calc(env(safe-area-inset-top)+20vh))]' as const
const PLANNER_PANEL_BOTTOM =
  'bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))]' as const

export function PlannerHubPanel({
  mood,
  onMoodChange,
  budgetIdx,
  onBudgetChange,
  mbti,
  defaultOpen = false,
  onOpenChange,
  onSelectPlace,
}: PlannerHubPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { locale, t } = useI18n()
  const plannerMoodMeta = getPlannerMoodMeta(locale)
  const budgetLabels = getDailyBudgetLabels(locale)

  const plannerMood = normalizePlannerMood(mood)
  const mbtiMeta = MBTI_TYPES.find((type) => type.id === mbti)

  function setPanelOpen(next: boolean) {
    setOpen(next)
    onOpenChange?.(next)
  }

  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function handleSelectPlace(rec: PlannerRecommendation) {
    onSelectPlace?.(rec)
    setPanelOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? t('planner.close') : t('planner.open')}
        className={cn(
          'pointer-events-auto fixed z-20 flex items-center justify-center',
          'left-[max(0.65rem,env(safe-area-inset-left))]',
          PLANNER_TOP,
          'h-[3.35rem] w-[3.35rem] rounded-2xl border transition-all duration-300',
          'glass-panel shadow-glass backdrop-blur-xl',
          open
            ? 'border-sky-400/55 bg-sky-400/14 text-sky-600 dark:text-sky-300'
            : 'border-[var(--nora-border-strong)] text-[var(--nora-text)] hover:border-sky-400/35',
        )}
      >
        <CalendarDays className="h-5 w-5" strokeWidth={open ? 2.25 : 1.75} aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label={t('common.close')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto fixed inset-0 z-30 bg-[color-mix(in_srgb,var(--nora-bg-base)_45%,transparent)] backdrop-blur-md"
              onClick={() => setPanelOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="planner-hub-title"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 32 }}
              className={cn(
                'pointer-events-auto fixed z-40 flex min-h-0 w-[min(20rem,92vw)] flex-col',
                'left-0',
                PLANNER_TOP,
                PLANNER_PANEL_BOTTOM,
                'border-r border-[var(--nora-border-strong)] glass-panel-strong shadow-glass-lg',
              )}
            >
              <header className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--nora-border-subtle)] px-3 py-3">
                <div>
                  <p
                    id="planner-hub-title"
                    className="text-[10px] font-semibold uppercase tracking-wide text-sky-500 dark:text-sky-400"
                  >
                    {t('planner.title')}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--nora-text-muted)]">
                    {t('planner.subtitle')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="rounded-lg p-1.5 text-[var(--nora-text-muted)] hover:bg-[var(--nora-surface-veil)] hover:text-[var(--nora-text)]"
                  aria-label={t('common.close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2.5 pr-1.5 [scrollbar-width:thin] [scrollbar-color:color-mix(in_srgb,var(--nora-accent)_40%,transparent)_transparent]">
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
                          'flex w-full flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-center transition-all',
                          mood === m.id
                            ? cn(
                                'border-sky-400/55 bg-sky-400/12 ring-2',
                                m.ring,
                              )
                            : 'border-[var(--nora-border-subtle)] bg-[var(--nora-surface-veil)] hover:border-sky-400/30',
                        )}
                      >
                        <span className="text-xl leading-none" aria-hidden>
                          {m.emoji}
                        </span>
                        <span className="text-[10px] font-medium leading-tight text-[var(--nora-text)]">
                          {plannerMoodMeta[m.id as PlannerMood].label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <section className="mt-3 rounded-xl border border-[var(--nora-border-subtle)] bg-[var(--nora-surface-veil)] p-2.5">
                  <div className="flex items-center gap-2">
                    <Coins
                      className="h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400"
                      aria-hidden
                    />
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

                <section className="mt-3 rounded-xl border border-[var(--nora-border-subtle)] bg-[var(--nora-surface-veil)] p-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles
                      className="h-3.5 w-3.5 shrink-0 text-sky-500 dark:text-sky-400"
                      aria-hidden
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nora-text-muted)]">
                      {t('planner.personality')}
                    </p>
                  </div>
                  {mbti ? (
                    <p className="mt-1.5 text-xs text-[var(--nora-text)]">
                      <span className="font-semibold text-sky-600 dark:text-sky-300">
                        {mbti}
                      </span>
                      {mbtiMeta ? (
                        <span className="text-[var(--nora-text-muted)]">
                          {' '}
                          · {mbtiMeta.subtitle}
                        </span>
                      ) : null}
                    </p>
                  ) : (
                    <div className="mt-1.5 space-y-1">
                      <p className="text-[11px] text-[var(--nora-text-muted)]">
                        {t('planner.personalityHint')}
                      </p>
                      <MbtiHelpDialog triggerClassName="text-[11px]" />
                    </div>
                  )}
                  <Link
                    href="/passport"
                    className="mt-1.5 inline-block text-[11px] text-sky-600 hover:underline dark:text-sky-400"
                    onClick={() => setPanelOpen(false)}
                  >
                    {t('planner.editPassport')}
                  </Link>
                </section>

                <div className="mt-4 border-t border-[var(--nora-border-subtle)] pt-3 pb-1">
                  <PlannerRecommendationsList
                    mood={plannerMood}
                    budgetIdx={budgetIdx}
                    mbti={mbti}
                    onSelect={handleSelectPlace}
                    compact
                  />
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
