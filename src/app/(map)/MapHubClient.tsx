'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { Coins, MapPin } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { useAuth } from '@/contexts/useAuth'
import { cn } from '@/lib/utils'
import type { MoodPreset, ZoneKey } from '@/types/user'
import type { NoraMapHandle } from './map-types'

type MapForDwell = NoraMapHandle

const MapCanvas = dynamic(() => import('./MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-0 flex flex-col items-center justify-center gap-2 bg-[#020617] text-slate-300">
      <span className="text-sm font-medium text-sky-400">NORA</span>
      <p className="text-xs text-slate-500">Карта загружается…</p>
    </div>
  ),
})

const MOODS: { id: MoodPreset; emoji: string; label: string; ring: string }[] =
  [
    {
      id: 'calm',
      emoji: '🧘',
      label: 'В норме',
      ring: 'ring-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.35)]',
    },
    {
      id: 'energy',
      emoji: '🔋',
      label: 'Энергична',
      ring: 'ring-cyan-300/55 shadow-[0_0_22px_rgba(34,211,238,0.4)]',
    },
    {
      id: 'tired',
      emoji: '😫',
      label: 'Устала',
      ring: 'ring-blue-500/45 shadow-[0_0_18px_rgba(59,130,246,0.35)]',
    },
    {
      id: 'anxious',
      emoji: '😰',
      label: 'Тревожно',
      ring: 'ring-indigo-400/45 shadow-[0_0_20px_rgba(129,140,248,0.35)]',
    },
  ]

const BUDGET_LABELS = [
  'до ~1 500 ₽',
  '~1 500–3 500 ₽',
  '~3 500–7 000 ₽',
  '7 000+ ₽',
]

function distanceMeters(
  a: { lng: number; lat: number },
  b: { lng: number; lat: number },
) {
  const R = 111_320
  const dx = (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180) * R
  const dy = (a.lat - b.lat) * R
  return Math.hypot(dx, dy)
}

function zoneAt(
  center: { lng: number; lat: number },
  zones: Partial<Record<ZoneKey, { lng: number; lat: number }>>,
): ZoneKey | null {
  let best: { key: ZoneKey; d: number } | null = null
  const keys: ZoneKey[] = ['home', 'work', 'school']
  for (const key of keys) {
    const z = zones[key]
    if (!z) continue
    const d = distanceMeters(center, z)
    if (d < 220 && (!best || d < best.d)) best = { key, d }
  }
  return best?.key ?? null
}

export default function MapHubClient() {
  const { user, updateProfile } = useAuth()
  const userRef = useRef(user)
  userRef.current = user
  const mapRef = useRef<MapForDwell | null>(null)
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastZone = useRef<ZoneKey | null>(null)

  const [mood, setMood] = useState<MoodPreset>(() => {
    const m = user?.initialMood
    if (m === 'calm' || m === 'energy' || m === 'tired' || m === 'anxious')
      return m
    return 'calm'
  })
  const [budgetIdx, setBudgetIdx] = useState(user?.dailyBudgetIndex ?? 1)
  const [insight, setInsight] = useState<{
    zone: ZoneKey
    title: string
    body: string
  } | null>(null)

  const markers = useMemo(() => {
    if (!user?.zones) return []
    const out: { id: string; lng: number; lat: number; color?: string }[] = []
    const colors: Record<ZoneKey, string> = {
      home: '#38bdf8',
      work: '#2563eb',
      school: '#7dd3fc',
    }
    ;(['home', 'school', 'work'] as ZoneKey[]).forEach((k) => {
      const z = user.zones[k]
      if (z) out.push({ id: k, lng: z.lng, lat: z.lat, color: colors[k] })
    })
    return out
  }, [user?.zones])

  const clearDwell = useCallback(() => {
    if (dwellTimer.current) {
      clearTimeout(dwellTimer.current)
      dwellTimer.current = null
    }
  }, [])

  const scheduleDwell = useCallback(
    (center: { lng: number; lat: number }) => {
      clearDwell()
      const zones = userRef.current?.zones
      if (!zones) return
      const z = zoneAt(center, zones)
      if (!z || (z !== 'home' && z !== 'work')) {
        lastZone.current = null
        setInsight(null)
        return
      }
      lastZone.current = z
      dwellTimer.current = setTimeout(() => {
        const map = mapRef.current
        const c = map?.getCenter()
        if (!c) return
        const still = zoneAt({ lng: c.lng, lat: c.lat }, userRef.current?.zones ?? {})
        if (still !== z) return
        const mbti = userRef.current?.mbti
        const mbtiLine =
          mbti && mbti.length
            ? `Идеально для твоего типа ${mbti}.`
            : 'Это место совпадает с твоей зоной — хороший момент для паузы.'
        const title = z === 'home' ? 'Дом — твоя база' : 'Работа — фокус'
        const body =
          z === 'home'
            ? `${mbtiLine} Здесь проще восстановить ритм дня и снять фоновое напряжение.`
            : `${mbtiLine} Короткий перерыв у экрана или прогулка вокруг точки помогут восстановить энергию.`
        setInsight({ zone: z, title, body })
      }, 10_000)
    },
    [clearDwell],
  )

  const onMap = useCallback(
    (map: MapForDwell) => {
      mapRef.current = map
      const run = () => {
        const c = map.getCenter()
        scheduleDwell({ lng: c.lng, lat: c.lat })
      }
      map.on('moveend', run)
      run()
    },
    [scheduleDwell],
  )

  useEffect(() => {
    if (!user?.id) return
    const m = user.initialMood
    if (m === 'calm' || m === 'energy' || m === 'tired' || m === 'anxious') {
      setMood(m)
    }
    setBudgetIdx(user.dailyBudgetIndex)
  }, [user?.id, user?.initialMood, user?.dailyBudgetIndex])

  useEffect(() => {
    return () => clearDwell()
  }, [clearDwell])

  useEffect(() => {
    if (!user?.id) return
    const handle = window.setTimeout(() => {
      updateProfile({ initialMood: mood, dailyBudgetIndex: budgetIdx })
    }, 500)
    return () => window.clearTimeout(handle)
  }, [mood, budgetIdx, user?.id, updateProfile])

  return (
    <>
      <MapCanvas onMap={onMap} markers={markers} />

      <div className="pointer-events-none fixed inset-0 z-10 flex flex-col nora-map-overlay">
        <div className="pointer-events-auto mx-auto mt-[max(0.75rem,env(safe-area-inset-top))] flex w-[min(96vw,560px)] gap-2 overflow-x-auto rounded-2xl border border-[var(--nora-border)] glass-panel px-2 py-2 shadow-lg">
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(m.id)}
              className={cn(
                'flex min-w-[5.5rem] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-all',
                mood === m.id
                  ? cn('bg-sky-400/15 text-sky-200 ring-2', m.ring)
                  : 'text-[var(--nora-text-muted)] hover:bg-white/5 hover:text-[var(--nora-text)]',
              )}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="leading-tight">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="pointer-events-none mt-auto flex w-full flex-col items-center gap-2 px-3 pb-[calc(72px+env(safe-area-inset-bottom,0px))]">
          <a
            href="https://organicmaps.app/ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex max-w-[min(96vw,420px)] items-center gap-2 rounded-full border border-[var(--nora-border)] glass-panel px-3 py-1.5 text-[11px] text-[var(--nora-text-muted)] shadow-md transition-colors hover:border-sky-400/35 hover:text-sky-200"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400/90" aria-hidden />
            <span>
              Те же{' '}
              <span className="font-medium text-[var(--nora-text)]">OpenStreetMap</span>, что
              в{' '}
              <span className="font-medium text-sky-300">Organic Maps</span>
              — офлайн, без рекламы и слежки
            </span>
          </a>
          <div className="pointer-events-auto flex w-[min(96vw,420px)] items-center gap-3 rounded-2xl border border-[var(--nora-border)] glass-panel px-4 py-3 shadow-xl">
            <Coins className="h-5 w-5 shrink-0 text-sky-300" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--nora-text-muted)]">
                Бюджет на сегодня
              </p>
              <p className="truncate text-sm text-[var(--nora-text)]">
                {BUDGET_LABELS[budgetIdx] ?? BUDGET_LABELS[1]}
              </p>
              <Slider
                className="mt-2"
                min={0}
                max={3}
                step={1}
                value={[budgetIdx]}
                onValueChange={(v) => setBudgetIdx(v[0] ?? 1)}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {insight ? (
          <motion.div
            key="insight"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-30 mx-auto w-[min(96vw,440px)] px-3"
          >
            <div className="rounded-2xl border border-[var(--nora-border)] glass-panel-strong p-4 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                    NORA Insight
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-[var(--nora-text)]">
                    {insight.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--nora-text-muted)]">
                    {insight.body}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-xs text-[var(--nora-text-muted)] hover:bg-white/5 hover:text-[var(--nora-text)]"
                  onClick={() => setInsight(null)}
                >
                  Скрыть
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
