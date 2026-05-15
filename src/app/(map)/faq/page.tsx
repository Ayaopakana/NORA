'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PageShell } from '@/components/PageShell'
import { FAQ_ITEMS } from '@/lib/faq'
import { cn } from '@/lib/utils'

export default function FaqPage() {
  return (
    <PageShell>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
          Помощь
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Частые вопросы</h1>
        <p className="mt-2 text-sm text-[var(--nora-text-muted)]">
          Ответы о карте, партнёрах, друзьях и чате.
        </p>
      </header>

      <ul className="space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.28 }}
          >
            <details className="group rounded-2xl border border-[var(--nora-border)] glass-panel">
              <summary
                className={cn(
                  'flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[var(--nora-text)]',
                  '[&::-webkit-details-marker]:hidden',
                )}
              >
                <span>{item.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-sky-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="border-t border-[var(--nora-border)] px-4 py-3 text-sm leading-relaxed text-[var(--nora-text-muted)]">
                {item.answer}
              </p>
            </details>
          </motion.li>
        ))}
      </ul>
    </PageShell>
  )
}
