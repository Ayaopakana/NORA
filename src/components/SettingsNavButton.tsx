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
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-glass glass-panel text-[var(--nora-text)] shadow-glass transition-all duration-300 hover:shadow-glass-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--nora-accent)_55%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nora-bg-base)]',
        active && 'ring-2 ring-sky-400/50 text-sky-400',
        className,
      )}
    >
      <Settings className="h-[1.1rem] w-[1.1rem]" strokeWidth={active ? 2.25 : 1.75} />
    </Link>
  )
}
