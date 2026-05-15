import { Suspense } from 'react'
import LoginPageClient from './LoginPageClient'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[var(--nora-bg)] text-sm text-[var(--nora-text-muted)]">
          Загрузка…
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  )
}
