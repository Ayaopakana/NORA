'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function SettingsNavButton({ className }: { className?: string }) {
  const pathname = usePathname() ?? ''
  const active =
    pathname === '/settings' || pathname.startsWith('/settings/')

  return (
    <Link
      href="/settings"
      aria-label="Настройки"
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--nora-border)] glass-panel text-[var(--nora-text)] shadow-none transition-colors hover:bg-[var(--nora-surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nora-bg)]',
        active && 'ring-2 ring-sky-400/50 text-sky-400',
        className,
      )}
    >
      <Settings className="h-[1.1rem] w-[1.1rem]" strokeWidth={active ? 2.25 : 1.75} />
    </Link>
  )
}
