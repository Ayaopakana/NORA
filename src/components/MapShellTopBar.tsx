'use client'

import { SettingsNavButton } from '@/components/SettingsNavButton'
import { ThemeToggle } from '@/components/ThemeToggle'

/** Переключатель темы и кнопка «Настройки» справа сверху на всех страницах карты. */
export function MapShellTopBar() {
  return (
    <div className="pointer-events-none fixed right-3 top-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto flex items-center gap-2">
        <ThemeToggle />
        <SettingsNavButton />
      </div>
    </div>
  )
}
