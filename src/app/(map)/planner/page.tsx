'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Coins, MapPin, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PlaceMapDialog } from '@/components/planner/PlaceMapDialog'
import { RequireAuth } from '@/components/RequireAuth'
import { dailyBudgetLabel } from '@/lib/daily-budget'
import {
  budgetLabelForTier,
  fitsUserBudget,
  getRecommendationsForMoodAndBudget,
  normalizePlannerMood,
  PLANNER_MOOD_META,
  recommendationInsight,
  type PlannerMood,
  type PlannerRecommendation,
} from '@/lib/planner-recommendations'
import { useAuth } from '@/contexts/useAuth'
import { cn } from '@/lib/utils'
import { displayName } from '@/types/user'
import type { MoodPreset } from '@/types/user'

const MOOD_ORDER: PlannerMood[] = ['calm', 'energy', 'tired', 'anxious']

export default function PlannerPage() {
  return (
    <RequireAuth>
      <PlannerContent />
    </RequireAuth>
  )
}

function PlannerContent() {
  const { user, updateProfile } = useAuth()
  const [mood, setMood] = useState<PlannerMood>(() =>
    normalizePlannerMood(user?.initialMood),
  )
  const [mapPlace, setMapPlace] = useState<PlannerRecommendation | null>(null)
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    setMood(normalizePlannerMood(user.initialMood))
  }, [user?.id, user?.initialMood])

  useEffect(() => {
    if (!user?.id) return
    const handle = window.setTimeout(() => {
      updateProfile({ initialMood: mood as MoodPreset })
    }, 500)
    return () => window.clearTimeout(handle)
  }, [mood, user?.id, updateProfile])

  const budgetIdx = user?.dailyBudgetIndex ?? 1

  const recommendations = useMemo(
    () => getRecommendationsForMoodAndBudget(mood, budgetIdx),
    [mood, budgetIdx],
  )

  const moodMeta = PLANNER_MOOD_META[mood]

  if (!user) return null

  function openOnMap(rec: PlannerRecommendation) {
    setMapPlace(rec)
    setMapOpen(true)
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-nav-only pt-[max(4.5rem,env(safe-area-inset-top))]">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
          NORA Planner
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Маршруты на сегодня</h1>
        <p className="mt-2 text-sm text-[var(--nora-text-muted)]">
          Подбор для{' '}
          <span className="text-[var(--nora-text)]">{displayName(user)}</span>
          {user.mbti ? (
            <>
              {' '}
              · тип{' '}
              <span className="font-medium text-sky-300">{user.mbti}</span>
            </>
          ) : null}
          .
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full glass-chip px-2.5 py-1 text-xs text-[var(--nora-text-muted)]">
          <Coins className="h-3.5 w-3.5 text-sky-400" aria-hidden />
          Бюджет на сегодня:{' '}
          <span className="font-medium text-[var(--nora-text)]">
            {dailyBudgetLabel(budgetIdx)}
          </span>
        </p>
      </header>

      <section className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--nora-text-muted)]">
          Ваше состояние
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MOOD_ORDER.map((id) => {
            const meta = PLANNER_MOOD_META[id]
            const active = mood === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMood(id)}
                className={cn(
                  'flex shrink-0 flex-col items-center gap-1 rounded-glass border px-3 py-2 text-center transition-all duration-300',
                  active
                    ? 'border-[color-mix(in_srgb,var(--nora-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--nora-accent)_12%,transparent)] shadow-glass neon-ring'
                    : 'border-[var(--nora-border-subtle)] glass-chip hover:shadow-glass',
                )}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {meta.emoji}
                </span>
                <span className="text-[11px] font-medium leading-tight text-[var(--nora-text)]">
                  {meta.label}
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-[var(--nora-text-muted)]">
          {moodMeta.hint}
        </p>
      </section>

      <AnimatePresence mode="wait">
        <motion.ul
          key={`${mood}-${budgetIdx}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {recommendations.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
            >
              <button
                type="button"
                onClick={() => openOnMap(r)}
                className="group w-full rounded-glass-lg border border-[var(--nora-border-subtle)] glass-panel p-4 text-left shadow-glass transition-all duration-300 hover:border-[color-mix(in_srgb,var(--nora-accent)_35%,transparent)] hover:shadow-glass-lg active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--nora-text)] group-hover:text-sky-200">
                      {r.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--nora-text-muted)]">
                      {r.place}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--nora-text-muted)]/80">
                      {r.address}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full glass-chip px-2 py-0.5 text-[11px] text-[var(--nora-text-muted)]">
                    {r.duration}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--nora-text-muted)]">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                      fitsUserBudget(r, budgetIdx)
                        ? 'border border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
                        : 'border border-amber-400/35 bg-amber-400/10 text-amber-100',
                    )}
                  >
                    <Coins className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {budgetLabelForTier(r.budgetTier)}
                    {fitsUserBudget(r, budgetIdx) ? ' · в бюджете' : ''}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/35 bg-sky-400/10 px-2 py-0.5 text-[11px] font-medium text-sky-200">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {recommendationInsight(r, user.mbti, budgetIdx)}
                  </span>
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-sky-400">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  Показать на карте
                </p>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>

      <PlaceMapDialog
        open={mapOpen}
        onOpenChange={setMapOpen}
        place={mapPlace}
      />
    </div>
  )
}
