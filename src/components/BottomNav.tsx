'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, MapPin, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'Карта', icon: MapPin },
  { href: '/planner', label: 'Планер', icon: CalendarDays },
  { href: '/passport', label: 'Паспорт', icon: UserRound },
] as const

export function BottomNav() {
  const pathname = usePathname() ?? ''

  return (
    <nav
      className="nora-bottom-nav fixed bottom-0 left-0 right-0 z-40 flex h-[calc(64px+env(safe-area-inset-bottom,0px))] items-stretch justify-around border-t border-[var(--nora-border)] glass-panel px-2 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-glass"
      aria-label="Основная навигация"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === '/'
            ? pathname === '/' || pathname === ''
            : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
              active
                ? 'text-sky-400'
                : 'text-[var(--nora-text-muted)] hover:text-[var(--nora-text)]',
            )}
          >
            <Icon
              className={cn(
                'h-6 w-6',
                active && 'drop-shadow-[0_0_10px_rgba(56,189,248,0.55)]',
              )}
              strokeWidth={active ? 2.25 : 1.75}
            />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
