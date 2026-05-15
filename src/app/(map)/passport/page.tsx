'use client'

import { Home, Briefcase, GraduationCap, LogOut } from 'lucide-react'
import { useState } from 'react'
import { AvatarFace } from '@/components/AvatarFace'
import { CountryCombobox } from '@/components/CountryCombobox'
import { MbtiGrid } from '@/components/MbtiGrid'
import { RequireAuth } from '@/components/RequireAuth'
import { ZonePickerDialog } from '@/components/ZonePickerDialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/useAuth'
import { COUNTRIES } from '@/lib/countries'
import type { MbtiId } from '@/lib/mbti'
import { cn } from '@/lib/utils'
import { displayName } from '@/types/user'
import type { UserStatus, ZoneKey } from '@/types/user'

export default function PassportPage() {
  return (
    <RequireAuth>
      <PassportContent />
    </RequireAuth>
  )
}

function PassportContent() {
  const { user, updateProfile, logout } = useAuth()
  const [origin, setOrigin] = useState(user?.countryOrigin ?? '')
  const [current, setCurrent] = useState(user?.countryCurrent ?? '')
  const [mbti, setMbti] = useState<MbtiId | ''>(user?.mbti ?? '')
  const [status, setStatus] = useState<UserStatus>(user?.userStatus ?? '')
  const [zoneOpen, setZoneOpen] = useState(false)
  const [zoneKey, setZoneKey] = useState<ZoneKey>('home')
  const [saved, setSaved] = useState(false)

  if (!user) return null

  const shown = displayName(user)

  const STATUSES: { id: UserStatus; label: string }[] = [
    { id: 'student', label: 'Студент' },
    { id: 'tourist', label: 'Турист' },
    { id: 'expat', label: 'Экспат' },
    { id: 'local', label: 'Местный' },
  ]

  function onSave() {
    updateProfile({
      countryOrigin: origin,
      countryCurrent: current,
      mbti,
      userStatus: status,
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  function openZone(k: ZoneKey) {
    setZoneKey(k)
    setZoneOpen(true)
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-nav-only pt-[max(4.5rem,env(safe-area-inset-top))]">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <AvatarFace src={user.avatarUrl} displayName={shown} size={72} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
              Mental Passport
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Профиль NORA</h1>
            <p className="mt-1 text-sm text-[var(--nora-text-muted)]">
              {shown} · {user.email}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Выйти"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <section className="mb-6 space-y-4 rounded-2xl border border-[var(--nora-border)] glass-panel p-4">
        <h2 className="text-sm font-semibold text-[var(--nora-text)]">
          Локации
        </h2>
        <div>
          <span className="mb-1 block text-xs font-medium text-[var(--nora-text-muted)]">
            Страна, где я выросла
          </span>
          <CountryCombobox
            countries={COUNTRIES}
            value={origin}
            onChange={setOrigin}
            placeholder="Выберите страну"
            label="Страна происхождения"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-[var(--nora-text-muted)]">
            Где я сейчас
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
          <span className="mb-1 block text-xs font-medium text-[var(--nora-text-muted)]">
            Статус
          </span>
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
                    : 'border-[var(--nora-border)] text-[var(--nora-text-muted)] hover:border-sky-400/35',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-[var(--nora-border)] glass-panel p-4">
        <h2 className="text-sm font-semibold text-[var(--nora-text)]">MBTI</h2>
        <p className="mt-1 text-xs text-[var(--nora-text-muted)]">
          Выбранный тип подсвечивается неоновым свечением — как в онбординге.
        </p>
        <div className="mt-4">
          <MbtiGrid value={mbti} onChange={setMbti} />
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-[var(--nora-border)] glass-panel p-4">
        <h2 className="text-sm font-semibold text-[var(--nora-text)]">
          Smart Zones
        </h2>
        <p className="mt-1 text-xs text-[var(--nora-text-muted)]">
          Отметьте дом, учёбу и работу — NORA использует это для баланса и
          подсказок на карте.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            className="justify-start gap-2"
            onClick={() => openZone('home')}
          >
            <Home className="h-4 w-4 text-sky-300" />
            Добавить дом
            {user.zones.home ? (
              <span className="ml-auto text-[11px] text-emerald-400">
                сохранено
              </span>
            ) : null}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="justify-start gap-2"
            onClick={() => openZone('school')}
          >
            <GraduationCap className="h-4 w-4 text-sky-300" />
            Добавить учёбу
            {user.zones.school ? (
              <span className="ml-auto text-[11px] text-emerald-400">
                сохранено
              </span>
            ) : null}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="justify-start gap-2"
            onClick={() => openZone('work')}
          >
            <Briefcase className="h-4 w-4 text-sky-300" />
            Добавить работу
            {user.zones.work ? (
              <span className="ml-auto text-[11px] text-emerald-400">
                сохранено
              </span>
            ) : null}
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onSave}>
          Сохранить паспорт
        </Button>
        {saved ? (
          <span className="text-sm text-emerald-400" role="status">
            Сохранено
          </span>
        ) : null}
      </div>

      <ZonePickerDialog
        open={zoneOpen}
        onOpenChange={setZoneOpen}
        zone={zoneKey}
        title={
          zoneKey === 'home'
            ? 'Дом'
            : zoneKey === 'school'
              ? 'Учёба'
              : 'Работа'
        }
        initial={user.zones[zoneKey] ?? null}
        onSave={(point) => {
          updateProfile({ zones: { [zoneKey]: point } })
        }}
      />
    </div>
  )
}
