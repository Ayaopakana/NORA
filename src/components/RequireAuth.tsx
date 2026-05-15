'use client'

import { useAuth } from '@/contexts/useAuth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname() ?? ''

  useEffect(() => {
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [user, router, pathname])

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--nora-text-muted)]">
        Проверяем сессию…
      </div>
    )
  }

  return <>{children}</>
}
