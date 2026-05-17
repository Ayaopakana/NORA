'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Coins, MapPin, Sparkles } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import {
  budgetLabelForTier,
  fitsUserBudget,
  getPlannerMoodMeta,
  getRecommendationsForMoodAndBudget,
  recommendationInsight,
  type PlannerMood,
  type PlannerRecommendation,
} from '@/lib/planner-recommendations'
import type { MbtiId } from '@/lib/mbti'
import { cn } from '@/lib/utils'

type PlannerRecommendationsListProps = {
  mood: PlannerMood
  budgetIdx: number
  mbti: MbtiId | ''
  onSelect: (place: PlannerRecommendation) => void
  compact?: boolean
}

export function PlannerRecommendationsList({
  mood,
  budgetIdx,
  mbti,
  onSelect,
  compact = false,
}: PlannerRecommendationsListProps) {
  const { locale, t } = useI18n()
  const recommendations = getRecommendationsForMoodAndBudget(
    mood,
    budgetIdx,
    locale,
  )
  const moodMeta = getPlannerMoodMeta(locale)[mood]

  return (
    <section>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--nora-text-muted)]">
        {t('planner.whereToGo')}
      </p>
      <p className="mb-2 text-[11px] leading-snug text-[var(--nora-text-muted)]">
        {moodMeta.hint}
      </p>
      <AnimatePresence mode="sync" initial={false}>
        <motion.ul
          key={`${mood}-${budgetIdx}-${locale}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          {recommendations.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                className={cn(
                  'w-full rounded-xl border border-[var(--nora-border-subtle)] bg-[var(--nora-surface-veil)] text-left transition-all hover:border-sky-400/35 active:scale-[0.99]',
                  compact ? 'p-2.5' : 'p-3',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-[var(--nora-text)]">
                      {r.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--nora-text-muted)]">
                      {r.place}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-[var(--nora-text-muted)]">
                    {r.duration}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                      fitsUserBudget(r, budgetIdx)
                        ? 'bg-emerald-400/12 text-emerald-700 dark:text-emerald-200'
                        : 'bg-amber-400/12 text-amber-800 dark:text-amber-100',
                    )}
                  >
                    <Coins className="h-3 w-3" aria-hidden />
                    {budgetLabelForTier(r.budgetTier, locale)}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-400/10 px-1.5 py-0.5 text-[10px] text-sky-700 dark:text-sky-200">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    {recommendationInsight(r, mbti, budgetIdx, locale)}
                  </span>
                </div>
                <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {t('common.showOnMap')}
                </p>
              </button>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </section>
  )
}
