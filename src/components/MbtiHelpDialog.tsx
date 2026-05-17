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
import { useI18n } from '@/hooks/useI18n'
import { getMbtiTypes } from '@/i18n/content/mbti-types'
import { MBTI_TEST_URL } from '@/lib/mbti-links'
import { cn } from '@/lib/utils'

type MbtiHelpDialogProps = {
  triggerClassName?: string
  triggerLabel?: string
}

export function MbtiHelpDialog({
  triggerClassName,
  triggerLabel,
}: MbtiHelpDialogProps) {
  const { locale, t } = useI18n()
  const types = getMbtiTypes(locale)
  const label = triggerLabel ?? t('mbti.defaultHelp')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className={cn('h-auto px-0 text-xs text-sky-400', triggerClassName)}
        >
          <HelpCircle className="mr-1 h-3.5 w-3.5 shrink-0" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('mbtiHelp.title')}</DialogTitle>
          <DialogDescription>{t('mbtiHelp.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="gap-2">
            <a href={MBTI_TEST_URL} target="_blank" rel="noopener noreferrer">
              {t('mbtiHelp.takeTest')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/passport">{t('mbtiHelp.setInPassport')}</Link>
          </Button>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--nora-text-muted)]">
            {t('mbtiHelp.typesOverview')}
          </p>
          <ul className="mt-2 space-y-2 text-sm text-[var(--nora-text-muted)]">
            {types.map((type) => (
              <li key={type.id}>
                <strong className="text-[var(--nora-text)]">{type.id}</strong> —{' '}
                {type.subtitle}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
