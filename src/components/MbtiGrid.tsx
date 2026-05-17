'use client'

import { motion } from 'framer-motion'
import { MbtiHelpDialog } from '@/components/MbtiHelpDialog'
import { useI18n } from '@/hooks/useI18n'
import { getMbtiTypes } from '@/i18n/content/mbti-types'
import type { MbtiId } from '@/lib/mbti'
import { cn } from '@/lib/utils'

type MbtiGridProps = {
  value: MbtiId | ''
  onChange: (id: MbtiId) => void
}

export function MbtiGrid({ value, onChange }: MbtiGridProps) {
  const { locale, t } = useI18n()
  const types = getMbtiTypes(locale)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {types.map((mbtiType) => {
          const active = value === mbtiType.id
          return (
            <motion.button
              key={mbtiType.id}
              type="button"
              layout
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(mbtiType.id)}
              className={cn(
                'rounded-xl border px-2 py-3 text-left transition-colors',
                active
                  ? 'border-sky-400/70 bg-sky-400/10 neon-ring'
                  : 'border-[var(--nora-border-subtle)] glass-panel hover:border-[color-mix(in_srgb,var(--nora-accent)_35%,transparent)] hover:shadow-glass',
              )}
            >
              <p className="text-sm font-semibold text-[var(--nora-text)]">
                {mbtiType.title}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--nora-text-muted)]">
                {mbtiType.subtitle}
              </p>
            </motion.button>
          )
        })}
      </div>

      <MbtiHelpDialog triggerLabel={t('mbti.unknownType')} />
    </div>
  )
}
