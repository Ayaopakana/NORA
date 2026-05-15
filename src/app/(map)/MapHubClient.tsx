'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapMoodSheet } from '@/components/map/MapMoodSheet'
import { DailyBudgetLabel } from '@/components/DailyBudgetLabel'
import { BudgetStepSlider } from '@/components/BudgetStepSlider'
import { useAuth } from '@/contexts/useAuth'
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
  const [moodOpen, setMoodOpen] = useState(false)
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

      <MapMoodSheet
        open={moodOpen}
        onOpenChange={setMoodOpen}
        mood={mood}
        onMoodChange={setMood}
        mbti={user?.mbti ?? ''}
      />

      <div className="pointer-events-none fixed inset-0 z-10 flex flex-col nora-map-overlay">

        <div className="pointer-events-none mt-auto flex w-full flex-col items-center px-3 pb-[calc(72px+env(safe-area-inset-bottom,0px))]">
          <div className="pointer-events-auto flex w-[min(96vw,420px)] items-center gap-3 rounded-2xl border border-[var(--nora-border)] glass-panel px-4 py-3 shadow-xl">
            <Coins className="h-5 w-5 shrink-0 text-sky-300" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--nora-text-muted)]">
                Бюджет на сегодня
              </p>
              <DailyBudgetLabel
                index={budgetIdx}
                className="block w-full truncate text-sm text-[var(--nora-text)]"
              />
              <BudgetStepSlider
                className="mt-2"
                value={budgetIdx}
                onValueChange={setBudgetIdx}
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
            transition={{ type: 'spring', stiffness: 220, damping: 32 }}
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
