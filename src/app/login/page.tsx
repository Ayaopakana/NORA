import { Suspense } from 'react'
import { I18nLoadingText } from '@/components/I18nLoadingText'
import LoginPageClient from './LoginPageClient'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[var(--nora-bg)] text-sm text-[var(--nora-text-muted)]">
          <I18nLoadingText />
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  )
}
