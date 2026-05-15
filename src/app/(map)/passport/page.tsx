'use client'

import { Camera, Home, Briefcase, GraduationCap, LogOut } from 'lucide-react'
import { useRef, useState } from 'react'
import { AvatarFace } from '@/components/AvatarFace'
import { CountryCombobox } from '@/components/CountryCombobox'
import { MbtiGrid } from '@/components/MbtiGrid'
import { ProfileSocialSection } from '@/components/profile/ProfileSocialSection'
import { RequireAuth } from '@/components/RequireAuth'
import { ZonePickerDialog } from '@/components/ZonePickerDialog'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/PageShell'
import { useAuth } from '@/contexts/useAuth'
import { COUNTRIES } from '@/lib/countries'
import { readFileAsDataURL, validateAvatarFile } from '@/lib/readImage'
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
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name ?? '')
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [origin, setOrigin] = useState(user?.countryOrigin ?? '')
  const [current, setCurrent] = useState(user?.countryCurrent ?? '')
  const [mbti, setMbti] = useState<MbtiId | ''>(user?.mbti ?? '')
  const [status, setStatus] = useState<UserStatus>(user?.userStatus ?? '')
  const [zoneOpen, setZoneOpen] = useState(false)
  const [zoneKey, setZoneKey] = useState<ZoneKey>('home')
  const [saved, setSaved] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  if (!user) return null

  const shown = displayName({ nickname, name })

  const STATUSES: { id: UserStatus; label: string }[] = [
    { id: 'student', label: 'Студент' },
    { id: 'tourist', label: 'Турист' },
    { id: 'expat', label: 'Экспат' },
    { id: 'local', label: 'Местный' },
  ]

  function onSaveProfile() {
    if (name.trim().length < 2) {
      setAvatarError('Имя не короче 2 символов')
      return
    }
    if (nickname.trim().length < 2) {
      setAvatarError('Никнейм не короче 2 символов')
      return
    }
    setAvatarError(null)
    updateProfile({
      name: name.trim(),
      nickname: nickname.trim(),
      bio: bio.trim(),
      countryOrigin: origin,
      countryCurrent: current,
      mbti,
      userStatus: status,
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  async function onPickAvatar(file: File) {
    const err = validateAvatarFile(file)
    if (err) {
      setAvatarError(err)
      return
    }
    setAvatarError(null)
    try {
      const dataUrl = await readFileAsDataURL(file)
      updateProfile({ avatarUrl: dataUrl })
    } catch {
      setAvatarError('Не удалось загрузить фото')
    }
  }

  function openZone(k: ZoneKey) {
    setZoneKey(k)
    setZoneOpen(true)
  }

  return (
    <PageShell>
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
            Mental Passport
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Профиль</h1>
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

      <section className="mb-6 rounded-2xl border border-[var(--nora-border)] glass-panel p-4">
        <h2 className="text-sm font-semibold text-[var(--nora-text)]">
          Фото и описание
        </h2>

        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <AvatarFace
              src={user.avatarUrl}
              displayName={shown}
              size={96}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) void onPickAvatar(f)
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-1">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              {user.avatarUrl ? 'Сменить фото' : 'Загрузить фото'}
            </Button>
            {user.avatarUrl ? (
              <Button
                type="button"
                variant="ghost"
                className="text-sm"
                onClick={() => updateProfile({ avatarUrl: null })}
              >
                Убрать фото
              </Button>
            ) : null}
            <p className="text-[11px] text-[var(--nora-text-muted)]">
              JPEG, PNG, WebP до 2 МБ
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--nora-text-muted)]">
              Имя
            </span>
            <input
              className="h-11 w-full rounded-xl border border-[var(--nora-border)] bg-[var(--nora-surface)] px-3 text-sm text-[var(--nora-text)] outline-none ring-sky-400/40 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--nora-text-muted)]">
              Никнейм
            </span>
            <input
              className="h-11 w-full rounded-xl border border-[var(--nora-border)] bg-[var(--nora-surface)] px-3 text-sm text-[var(--nora-text)] outline-none ring-sky-400/40 focus:ring-2"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="nickname"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--nora-text-muted)]">
              Описание профиля
            </span>
            <textarea
              className="min-h-[88px] w-full resize-y rounded-xl border border-[var(--nora-border)] bg-[var(--nora-surface)] px-3 py-2 text-sm text-[var(--nora-text)] outline-none ring-sky-400/40 focus:ring-2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о себе: интересы, чем занимаетесь, что ищете в городе…"
              rows={3}
            />
          </label>
          <p className="text-xs text-[var(--nora-text-muted)]">{user.email}</p>
        </div>

        {avatarError ? (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {avatarError}
          </p>
        ) : null}
      </section>

      <ProfileSocialSection />

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
        <div className="mt-4">
          <MbtiGrid value={mbti} onChange={setMbti} />
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-[var(--nora-border)] glass-panel p-4">
        <h2 className="text-sm font-semibold text-[var(--nora-text)]">
          Smart Zones
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            className="justify-start gap-2"
            onClick={() => openZone('home')}
          >
            <Home className="h-4 w-4 text-sky-300" />
            Дом
            {user.zones.home ? (
              <span className="ml-auto text-[11px] text-emerald-400">✓</span>
            ) : null}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="justify-start gap-2"
            onClick={() => openZone('school')}
          >
            <GraduationCap className="h-4 w-4 text-sky-300" />
            Учёба
            {user.zones.school ? (
              <span className="ml-auto text-[11px] text-emerald-400">✓</span>
            ) : null}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="justify-start gap-2"
            onClick={() => openZone('work')}
          >
            <Briefcase className="h-4 w-4 text-sky-300" />
            Работа
            {user.zones.work ? (
              <span className="ml-auto text-[11px] text-emerald-400">✓</span>
            ) : null}
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onSaveProfile}>
          Сохранить профиль
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
    </PageShell>
  )
}
