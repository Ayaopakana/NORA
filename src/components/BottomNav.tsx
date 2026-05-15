'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  MapPin,
  MessageCircle,
  Search,
  UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'Карта', icon: MapPin },
  { href: '/search', label: 'Поиск', icon: Search },
  { href: '/chat', label: 'Чат', icon: MessageCircle },
  { href: '/planner', label: 'Планер', icon: CalendarDays },
  { href: '/passport', label: 'Профиль', icon: UserRound },
] as const

export function BottomNav() {
  const pathname = usePathname() ?? ''

  return (
    <nav
      className="nora-bottom-nav fixed bottom-0 left-0 right-0 z-50 shrink-0 border-t border-[var(--nora-border)] glass-panel backdrop-blur-glass"
      aria-label="Основная навигация"
    >
      <div className="flex h-16 min-w-0 items-stretch overflow-x-auto overflow-y-hidden px-1 pb-[env(safe-area-inset-bottom,0px)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                'flex min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors',
                active
                  ? 'text-sky-400'
                  : 'text-[var(--nora-text-muted)] hover:text-[var(--nora-text)]',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  active && 'drop-shadow-[0_0_10px_rgba(56,189,248,0.55)]',
                )}
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span className="max-w-[4.5rem] truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
