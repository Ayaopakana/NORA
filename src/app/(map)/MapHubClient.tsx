'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapLoadingFallback } from '@/components/map/MapLoadingFallback'
import { PlannerHubPanel } from '@/components/map/PlannerHubPanel'
import { useAuth } from '@/contexts/useAuth'
import { useI18n } from '@/hooks/useI18n'
import {
  findPlannerRecommendation,
  type PlannerRecommendation,
} from '@/lib/planner-recommendations'
import { cn } from '@/lib/utils'
import type { MoodPreset, ZoneKey } from '@/types/user'
import type { NoraMapHandle } from './map-types'

type MapForDwell = NoraMapHandle

const MapCanvas = dynamic(() => import('./MapCanvas'), {
  ssr: false,
  loading: () => <MapLoadingFallback />,
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
  const searchParams = useSearchParams()
  const plannerOpenDefault = searchParams?.get('planner') === 'open'
  const { user, updateProfile } = useAuth()
  const { locale, t } = useI18n()
  const userRef = useRef(user)
  userRef.current = user
  const mapRef = useRef<MapForDwell | null>(null)
  const focusPlaceRef = useRef<PlannerRecommendation | null>(null)
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastZone = useRef<ZoneKey | null>(null)
  const [mood, setMood] = useState<MoodPreset>(() => {
    const m = user?.initialMood
    if (m === 'calm' || m === 'energy' || m === 'tired' || m === 'anxious')
      return m
    return 'calm'
  })
  const [budgetIdx, setBudgetIdx] = useState(user?.dailyBudgetIndex ?? 1)
  const [statePanelOpen, setStatePanelOpen] = useState(false)
  const [focusPlaceId, setFocusPlaceId] = useState<string | null>(null)
  const [insightZone, setInsightZone] = useState<'home' | 'work' | null>(null)

  const focusPlace = useMemo(
    () => (focusPlaceId ? findPlannerRecommendation(focusPlaceId, locale) : null),
    [focusPlaceId, locale],
  )

  useEffect(() => {
    focusPlaceRef.current = focusPlace
  }, [focusPlace])

  useEffect(() => {
    setInsightZone(null)
  }, [locale])

  const insight = useMemo(() => {
    if (!insightZone) return null
    const mbti = user?.mbti
    const line =
      mbti && mbti.length
        ? t('map.mbtiIdeal', { mbti })
        : t('map.zonePause')
    const title =
      insightZone === 'home' ? t('map.homeTitle') : t('map.workTitle')
    const body = t(insightZone === 'home' ? 'map.homeBody' : 'map.workBody', {
      line,
    })
    return { title, body }
  }, [insightZone, user?.mbti, t])

  const markers = useMemo(() => {
    const out: { id: string; lng: number; lat: number; color?: string }[] = []
    const colors: Record<ZoneKey, string> = {
      home: '#38bdf8',
      work: '#2563eb',
      school: '#7dd3fc',
    }
    if (user?.zones) {
      ;(['home', 'school', 'work'] as ZoneKey[]).forEach((k) => {
        const z = user.zones[k]
        if (z) out.push({ id: k, lng: z.lng, lat: z.lat, color: colors[k] })
      })
    }
    if (focusPlace) {
      out.push({
        id: `plan-${focusPlace.id}`,
        lng: focusPlace.lng,
        lat: focusPlace.lat,
        color: '#f59e0b',
      })
    }
    return out
  }, [user?.zones, focusPlace])

  const flyToPlace = useCallback((rec: PlannerRecommendation) => {
    const map = mapRef.current
    if (!map) return
    map.flyTo({
      center: [rec.lng, rec.lat],
      zoom: 15.5,
      pitch: 52,
      bearing: map.getBearing(),
      duration: 1200,
    })
  }, [])

  const handleSelectPlace = useCallback(
    (rec: PlannerRecommendation) => {
      setFocusPlaceId(rec.id)
      setInsightZone(null)
      flyToPlace(rec)
    },
    [flyToPlace],
  )

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
        setInsightZone(null)
        return
      }
      lastZone.current = z
      dwellTimer.current = setTimeout(() => {
        const map = mapRef.current
        const c = map?.getCenter()
        if (!c) return
        const still = zoneAt({ lng: c.lng, lat: c.lat }, userRef.current?.zones ?? {})
        if (still !== z) return
        setInsightZone(z)
      }, 10_000)
    },
    [clearDwell],
  )

  const onMap = useCallback(
    (map: MapForDwell) => {
      mapRef.current = map
      const pending = focusPlaceRef.current
      if (pending) flyToPlace(pending)
      const run = () => {
        const c = map.getCenter()
        scheduleDwell({ lng: c.lng, lat: c.lat })
      }
      map.on('moveend', run)
      run()
    },
    [scheduleDwell, flyToPlace],
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

      <PlannerHubPanel
        mood={mood}
        onMoodChange={setMood}
        budgetIdx={budgetIdx}
        onBudgetChange={setBudgetIdx}
        mbti={user?.mbti ?? ''}
        defaultOpen={plannerOpenDefault}
        onOpenChange={setStatePanelOpen}
        onSelectPlace={handleSelectPlace}
      />

      <AnimatePresence>
        {focusPlace ? (
          <motion.div
            key={`${focusPlace.id}-${locale}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={cn(
              'pointer-events-auto fixed z-[25] w-full max-w-[min(18rem,88vw)]',
              statePanelOpen
                ? 'left-[max(calc(min(20rem,92vw)+0.75rem),env(safe-area-inset-left))] right-[max(0.5rem,env(safe-area-inset-right))]'
                : 'inset-x-[max(0.5rem,env(safe-area-inset-left))] mx-auto',
              'bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))]',
            )}
          >
            <div className="rounded-2xl border border-amber-400/40 bg-[var(--nora-surface-strong)] p-3 shadow-glass-lg backdrop-blur-xl">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">
                {t('planner.route')}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--nora-text)]">
                {focusPlace.title}
              </p>
              <p className="text-xs text-[var(--nora-text-muted)]">{focusPlace.place}</p>
              <button
                type="button"
                className="mt-2 text-xs text-[var(--nora-text-muted)] hover:text-[var(--nora-text)]"
                onClick={() => {
                  focusPlaceRef.current = null
                  setFocusPlaceId(null)
                }}
              >
                {t('planner.hideMarker')}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {insight ? (
          <motion.div
            key={`insight-${locale}`}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 32 }}
            className={cn(
              'pointer-events-none fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-[max(0.5rem,env(safe-area-inset-right))] z-30',
              statePanelOpen
                ? 'left-[max(calc(min(20rem,92vw)+0.5rem),env(safe-area-inset-left))]'
                : 'left-[max(0.5rem,env(safe-area-inset-left))]',
            )}
          >
            <div className="pointer-events-auto rounded-2xl border border-[var(--nora-border-strong)] glass-panel-strong p-4 shadow-glass-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-500 dark:text-sky-300">
                    {t('map.insightTitle')}
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
                  className="rounded-lg px-2 py-1 text-xs text-[var(--nora-text-muted)] hover:bg-[var(--nora-surface-veil)] hover:text-[var(--nora-text)]"
                  onClick={() => setInsightZone(null)}
                >
                  {t('map.insightHide')}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
