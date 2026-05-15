'use client'

import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MBTI_TYPES, type MbtiId } from '@/lib/mbti'
import { cn } from '@/lib/utils'

type MbtiGridProps = {
  value: MbtiId | ''
  onChange: (id: MbtiId) => void
}

export function MbtiGrid({ value, onChange }: MbtiGridProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MBTI_TYPES.map((t) => {
          const active = value === t.id
          return (
            <motion.button
              key={t.id}
              type="button"
              layout
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(t.id)}
              className={cn(
                'rounded-xl border px-2 py-3 text-left transition-colors',
                active
                  ? 'border-sky-400/70 bg-sky-400/10 neon-ring'
                  : 'border-[var(--nora-border)] glass-panel hover:border-sky-400/35',
              )}
            >
              <p className="text-sm font-semibold text-[var(--nora-text)]">
                {t.title}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--nora-text-muted)]">
                {t.subtitle}
              </p>
            </motion.button>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="link" className="h-auto px-0 text-xs text-sky-400">
            <HelpCircle className="mr-1 h-3.5 w-3.5" />
            Я не знаю свой тип
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>16 типов MBTI — кратко</DialogTitle>
            <DialogDescription>
              Выберите тип, который ближе всего описывает ваш стиль решений и
              восстановления энергии. Это можно изменить позже в паспорте.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm text-[var(--nora-text-muted)]">
            {MBTI_TYPES.map((t) => (
              <li key={t.id}>
                <strong className="text-[var(--nora-text)]">{t.id}</strong> —{' '}
                {t.subtitle}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  )
}
