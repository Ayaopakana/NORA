'use client'

import { ExternalLink, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MBTI_TEST_URL } from '@/lib/mbti-links'
import { MBTI_TYPES } from '@/lib/mbti'
import { cn } from '@/lib/utils'

type MbtiHelpDialogProps = {
  triggerClassName?: string
  triggerLabel?: string
}

export function MbtiHelpDialog({
  triggerClassName,
  triggerLabel = 'Не знаю свой тип',
}: MbtiHelpDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className={cn('h-auto px-0 text-xs text-sky-400', triggerClassName)}
        >
          <HelpCircle className="mr-1 h-3.5 w-3.5 shrink-0" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Как узнать свой MBTI?</DialogTitle>
          <DialogDescription>
            Пройдите короткий тест, затем выберите тип в паспорте NORA — маршруты
            и подсказки станут точнее.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="gap-2">
            <a href={MBTI_TEST_URL} target="_blank" rel="noopener noreferrer">
              Пройти тест
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/passport">Указать в паспорте</Link>
          </Button>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--nora-text-muted)]">
            16 типов — кратко
          </p>
          <ul className="mt-2 space-y-2 text-sm text-[var(--nora-text-muted)]">
            {MBTI_TYPES.map((t) => (
              <li key={t.id}>
                <strong className="text-[var(--nora-text)]">{t.id}</strong> —{' '}
                {t.subtitle}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
