'use client'

import { motion } from 'framer-motion'
import { MapPin, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import {
  PARTNER_CATEGORIES,
  PARTNERS,
  type PartnerCategory,
} from '@/lib/partners'
import { cn } from '@/lib/utils'

export default function PartnersPage() {
  const [category, setCategory] = useState<PartnerCategory | 'all'>('all')

  const list = useMemo(() => {
    if (category === 'all') return PARTNERS
    return PARTNERS.filter((p) => p.category === category)
  }, [category])

  return (
    <PageShell>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
          Партнёры NORA
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Кофейни и места рядом</h1>
        <p className="mt-2 text-sm text-[var(--nora-text-muted)]">
          Скидки и бонусы от заведений, с которыми мы сотрудничаем. Покажите карточку
          на кассе.
        </p>
      </header>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PARTNER_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors',
              category === c.id
                ? 'border-sky-400/70 bg-sky-400/15 text-sky-100 shadow-neon'
                : 'border-[var(--nora-border)] text-[var(--nora-text-muted)] hover:border-sky-400/35',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {list.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="rounded-2xl border border-[var(--nora-border)] glass-panel p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-2xl"
                aria-hidden
              >
                {p.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{p.name}</h2>
                  {p.discount ? (
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                      {p.discount}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[var(--nora-text-muted)]">
                  {p.tagline}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-[var(--nora-text-muted)]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-300" />
                  {p.address}
                </p>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-sky-200/90">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                  {p.perk}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => {
                window.location.href = '/'
              }}
            >
              Показать на карте
            </Button>
          </motion.li>
        ))}
      </ul>
    </PageShell>
  )
}
