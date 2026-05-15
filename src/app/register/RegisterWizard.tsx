'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Briefcase, GraduationCap, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import { CountryCombobox } from '@/components/CountryCombobox'
import { MbtiGrid } from '@/components/MbtiGrid'
import { MapboxSurface } from '@/components/map/MapboxSurface'
import { Button } from '@/components/ui/button'
import { DailyBudgetSlider } from '@/components/DailyBudgetSlider'
import { useAuth } from '@/contexts/useAuth'
import { COUNTRIES } from '@/lib/countries'
import type { MbtiId } from '@/lib/mbti'
import { cn } from '@/lib/utils'
import type { MoodPreset, UserStatus, UserZones, ZoneKey } from '@/types/user'

const STATUSES: { id: UserStatus; label: string }[] = [
  { id: 'student', label: 'Студент' },
  { id: 'tourist', label: 'Турист' },
  { id: 'expat', label: 'Экспат' },
  { id: 'local', label: 'Местный' },
]

const MOODS: { id: MoodPreset; emoji: string; label: string }[] = [
  { id: 'energy', emoji: '🔋', label: 'Энергична' },
  { id: 'calm', emoji: '🧘', label: 'В норме' },
  { id: 'tired', emoji: '😫', label: 'Устала' },
  { id: 'anxious', emoji: '😰', label: 'Тревожно' },
]

const BUDGET_LABELS = [
  'до ~1 500 ₽',
  '~1 500–3 500 ₽',
  '~3 500–7 000 ₽',
  '7 000+ ₽',
]

const BUDGET_COMFORT_MAP = [
  'economy',
  'moderate',
  'flexible',
  'flexible',
] as const

function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export function RegisterWizard() {
  const { register } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [origin, setOrigin] = useState('')
  const [current, setCurrent] = useState('')
  const [status, setStatus] = useState<UserStatus>('')

  const [mbti, setMbti] = useState<MbtiId | ''>('')

  const [zones, setZones] = useState<UserZones>({})
  const [activeZone, setActiveZone] = useState<ZoneKey | null>(null)
  const activeZoneRef = useRef<ZoneKey | null>(null)
  activeZoneRef.current = activeZone

  const pickStable = useCallback((p: { lng: number; lat: number }) => {
    const z = activeZoneRef.current
    if (!z) return
    setZones((prev) => ({ ...prev, [z]: p }))
  }, [])

  const markers = useMemo(() => {
    const out: { id: string; lng: number; lat: number; color?: string }[] = []
    const colors: Record<ZoneKey, string> = {
      home: '#38bdf8',
      school: '#7dd3fc',
      work: '#2563eb',
    }
    ;(['home', 'school', 'work'] as ZoneKey[]).forEach((k) => {
      const z = zones[k]
      if (z) out.push({ id: k, lng: z.lng, lat: z.lat, color: colors[k] })
    })
    return out
  }, [zones])

  const [mood, setMood] = useState<MoodPreset>('calm')
  const [budgetIdx, setBudgetIdx] = useState(1)

  const progress = useMemo(() => ((step + 1) / 4) * 100, [step])

  const canNext0 =
    nickname.trim().length >= 2 &&
    emailOk(email) &&
    password.length >= 4 &&
    password === confirm &&
    origin.length > 0 &&
    current.length > 0 &&
    status !== ''

  const canNext1 = mbti !== ''

  const canNext2 = Boolean(zones.home)

  const canFinish = budgetIdx >= 0

  async function finish() {
    setError(null)
    setPending(true)
    try {
      const name = nickname.trim()
      const extras = {
        countryOrigin: origin,
        countryCurrent: current,
        userStatus: status,
        mbti: mbti || undefined,
        zones,
        initialMood: mood,
        dailyBudgetIndex: budgetIdx,
        moodNote:
          MOODS.find((m) => m.id === mood)?.label ??
          'Стартовое настроение из регистрации',
        budgetComfort: BUDGET_COMFORT_MAP[budgetIdx] ?? 'moderate',
      }
      await register(
        name,
        nickname.trim(),
        email.trim(),
        password,
        null,
        extras,
      )
      setLeaving(true)
      window.setTimeout(() => {
        router.replace('/')
      }, 520)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка регистрации')
    } finally {
      setPending(false)
    }
  }

  function next() {
    setError(null)
    if (step < 3) setStep((s) => s + 1)
  }

  const disableNext =
    (step === 0 && !canNext0) ||
    (step === 1 && !canNext1) ||
    (step === 2 && !canNext2) ||
    (step === 3 && !canFinish)

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--nora-bg)] px-4 py-8 text-[var(--nora-text)]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div
          className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-20 bottom-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
          animate={{ x: [0, -36, 0], y: [0, -24, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-1/3 top-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="mx-auto max-w-lg pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="mb-6 h-1 overflow-hidden rounded-full bg-slate-800/60 dark:bg-slate-900/80">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 shadow-[0_0_18px_rgba(56,189,248,0.65)]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>

        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10, scale: 0.992 }}
            animate={
              leaving
                ? { opacity: 0, scale: 0.96, y: -6 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.48, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-2xl border border-[var(--nora-border)] glass-panel-strong p-6 shadow-2xl"
          >
            {step === 0 ? (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-semibold">Шаг 1 — контекст</h1>
                  <p className="mt-1 text-sm text-[var(--nora-text-muted)]">
                    Как к тебе обращаться и где ты находишься в жизненной
                    траектории.
                  </p>
                </div>
                <label className="block text-sm font-medium">Никнейм</label>
                <input
                  className="glass-input h-12 w-full px-3"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  autoComplete="nickname"
                  placeholder="Например, ayana_n"
                />
                <label className="block text-sm font-medium">Email</label>
                <input
                  className="glass-input h-12 w-full px-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  type="email"
                  placeholder="you@example.com"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="mb-1 block text-sm font-medium">
                      Пароль
                    </span>
                    <input
                      className="glass-input h-12 w-full px-3"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">
                      Повтор пароля
                    </span>
                    <input
                      className="glass-input h-12 w-full px-3"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      type="password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-sm font-medium">
                    Откуда ты?
                  </span>
                  <CountryCombobox
                    countries={COUNTRIES}
                    value={origin}
                    onChange={setOrigin}
                    placeholder="Страна, где выросла"
                    label="Страна происхождения"
                  />
                </div>
                <div>
                  <span className="mb-1 block text-sm font-medium">
                    Где ты сейчас?
                  </span>
                  <CountryCombobox
                    countries={COUNTRIES}
                    value={current}
                    onChange={setCurrent}
                    placeholder="Текущая страна"
                    label="Текущая страна"
                  />
                </div>
                <div>
                  <span className="mb-1 block text-sm font-medium">Статус</span>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStatus(s.id)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm transition-colors',
                          status === s.id
                            ? 'border-sky-400/70 bg-sky-400/15 text-sky-100 shadow-neon'
                            : 'border-[var(--nora-border)] bg-transparent text-[var(--nora-text-muted)] hover:border-sky-400/35',
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-semibold">Шаг 2 — MBTI</h1>
                  <p className="mt-1 text-sm text-[var(--nora-text-muted)]">
                    Выбери тип, который лучше всего описывает твой стиль мышления
                    и восстановления энергии.
                  </p>
                </div>
                <MbtiGrid value={mbti} onChange={setMbti} />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-semibold">Шаг 3 — Smart Zones</h1>
                  <p className="mt-1 text-sm text-[var(--nora-text-muted)]">
                    Выбери зону, затем тапни по карте, чтобы поставить точку.
                    Дом обязателен для баланса сценариев NORA.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'home' as const, label: 'Где живёшь?', icon: Home },
                      {
                        id: 'school' as const,
                        label: 'Где учишься?',
                        icon: GraduationCap,
                      },
                      {
                        id: 'work' as const,
                        label: 'Где работаешь?',
                        icon: Briefcase,
                      },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveZone(id)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors',
                        activeZone === id
                          ? 'border-sky-400/70 bg-sky-400/10 text-sky-100 shadow-neon'
                          : 'border-[var(--nora-border)] glass-panel text-[var(--nora-text)]',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="h-56 overflow-hidden rounded-xl border border-[var(--nora-border)]">
                  <MapboxSurface
                    className="h-full w-full"
                    pickPoint={pickStable}
                    markers={markers}
                  />
                </div>
                {!activeZone ? (
                  <p className="text-xs text-[var(--nora-text-muted)]">
                    Сначала выбери тип зоны (дом, учёба или работа).
                  </p>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl font-semibold">Шаг 4 — состояние</h1>
                  <p className="mt-1 text-sm text-[var(--nora-text-muted)]">
                    Как ты чувствуешь себя прямо сейчас? И какой бюджет на день
                    комфортен?
                  </p>
                </div>
                <p className="text-sm font-medium">Настроение</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm transition-colors',
                        mood === m.id
                          ? 'border-sky-400/70 bg-sky-400/10 neon-ring'
                          : 'border-[var(--nora-border)] glass-panel text-[var(--nora-text-muted)] hover:border-sky-400/35',
                      )}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Бюджет на сегодня</p>
                  <DailyBudgetSlider
                    value={budgetIdx}
                    onValueChange={setBudgetIdx}
                    labels={BUDGET_LABELS}
                    labelClassName="mt-1 text-xs text-[var(--nora-text-muted)]"
                    sliderClassName="mt-3"
                  />
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0 || pending || leaving}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Назад
              </Button>
              {step < 3 ? (
                <Button
                  type="button"
                  disabled={disableNext || pending || leaving}
                  onClick={next}
                >
                  Далее
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={disableNext || pending || leaving}
                  onClick={finish}
                >
                  {pending ? 'Создаём профиль…' : 'Завершить и открыть карту'}
                </Button>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-[var(--nora-text-muted)]">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-sky-400 hover:underline">
                Войти
              </Link>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
