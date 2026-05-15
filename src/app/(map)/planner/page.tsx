'use client'

import { motion } from 'framer-motion'
import { Coins, Sparkles } from 'lucide-react'
import { RequireAuth } from '@/components/RequireAuth'
import { displayName } from '@/types/user'
import { useAuth } from '@/contexts/useAuth'

const ROUTES = [
  {
    id: '1',
    title: 'Тихий кофе и чтение',
    place: 'Skyline Books · центр',
    duration: '1 ч 20 мин',
    budget: 'Умеренно',
    badge: 'Поможет восстановить энергию',
  },
  {
    id: '2',
    title: 'Вечерняя набережная',
    place: 'Прогулка вдоль воды',
    duration: '45 мин',
    budget: 'Экономно',
    badge: 'Идеально для твоего типа',
  },
  {
    id: '3',
    title: 'Мини-выставка света',
    place: 'Digital Garden Hall',
    duration: '55 мин',
    budget: 'Гибко',
    badge: 'Сбалансирует день после работы',
  },
] as const

export default function PlannerPage() {
  return (
    <RequireAuth>
      <PlannerContent />
    </RequireAuth>
  )
}

function PlannerContent() {
  const { user } = useAuth()
  if (!user) return null

  const mbti = user.mbti

  return (
    <div className="mx-auto max-w-lg px-4 pb-nav-only pt-[max(4.5rem,env(safe-area-inset-top))]">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
          NORA Planner
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Маршруты на сегодня</h1>
        <p className="mt-2 text-sm text-[var(--nora-text-muted)]">
          Подбор под настроение и бюджет для{' '}
          <span className="text-[var(--nora-text)]">
            {displayName(user)}
          </span>
          .
        </p>
      </header>

      <ul className="space-y-4">
        {ROUTES.map((r, i) => (
          <motion.li
            key={r.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
            className="rounded-2xl border border-[var(--nora-border)] glass-panel p-4 shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[var(--nora-text)]">
                  {r.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--nora-text-muted)]">
                  {r.place}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--nora-border)] bg-[var(--nora-surface)] px-2 py-0.5 text-[11px] text-[var(--nora-text-muted)]">
                {r.duration}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--nora-text-muted)]">
              <span className="inline-flex items-center gap-1">
                <Coins className="h-4 w-4 text-sky-300" aria-hidden />
                {r.budget}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/35 bg-sky-400/10 px-2 py-0.5 text-[11px] font-medium text-sky-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {mbti
                  ? `Идеально для твоего типа ${mbti}`
                  : `${r.badge}.`}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
