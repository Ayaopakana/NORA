'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FaqList } from '@/components/FaqList'
import { PartnersList } from '@/components/PartnersList'
import { SettingsSection } from '@/components/SettingsSection'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'

const SECTIONS = [
  {
    id: 'partners',
    title: 'Партнёры',
    description: 'Кофейни, еда и места со скидками для пользователей NORA',
    content: <PartnersList />,
  },
  {
    id: 'faq',
    title: 'Частые вопросы',
    description: 'Карта, друзья, чат и приватность',
    content: <FaqList />,
  },
] as const

export default function SettingsPage() {
  return (
    <PageShell className="pr-[6.25rem] sm:pr-4">
      <header className="mb-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 h-8 gap-1 px-2 text-[var(--nora-text-muted)]"
        >
          <Link href="/passport">
            <ArrowLeft className="h-4 w-4" />
            Профиль
          </Link>
        </Button>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
          Настройки
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Помощь и приложение</h1>
        <p className="mt-2 text-sm text-[var(--nora-text-muted)]">
          Нажмите на раздел, чтобы развернуть содержимое.
        </p>
      </header>

      <div className="space-y-3">
        {SECTIONS.map((section) => (
          <SettingsSection
            key={section.id}
            id={section.id}
            title={section.title}
            description={section.description}
          >
            {section.content}
          </SettingsSection>
        ))}
      </div>
    </PageShell>
  )
}
