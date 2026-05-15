'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/useAuth'

export default function LoginPageClient() {
  const { login } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const next = search?.get('next') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(email, password)
      router.replace(next.startsWith('/') ? next : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative min-h-dvh bg-[var(--nora-bg)] px-4 py-10 text-[var(--nora-text)]">
      <div className="pointer-events-none fixed right-3 top-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="rounded-2xl border border-[var(--nora-border)] glass-panel-strong p-6 shadow-2xl">
          <h1 className="text-xl font-semibold">Вход в NORA</h1>
          <p className="mt-2 text-sm text-[var(--nora-text-muted)]">
            Локальная демо-авторизация без сервера — данные хранятся в браузере.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="h-12 w-full rounded-xl border border-[var(--nora-border)] bg-[var(--nora-surface)] px-3 text-[var(--nora-text)] outline-none ring-sky-400/40 focus:ring-2"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="password"
              >
                Пароль
              </label>
              <input
                id="password"
                className="h-12 w-full rounded-xl border border-[var(--nora-border)] bg-[var(--nora-surface)] px-3 text-[var(--nora-text)] outline-none ring-sky-400/40 focus:ring-2"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>
            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Вход…' : 'Войти'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--nora-text-muted)]">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-sky-400 hover:underline">
              Пройти регистрацию
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
