'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapLoadingFallback } from '@/components/map/MapLoadingFallback'
import { DayRouteCard } from '@/components/map/DayRouteCard'
import { MapTopBar } from '@/components/map/MapTopBar'
import { PlannerHubPanel } from '@/components/map/PlannerHubPanel'
import { PlaceMapDialog } from '@/components/planner/PlaceMapDialog'
import { PlaceFeedbackPanel } from '@/components/planner/PlaceFeedbackPanel'
import type { DayRoute } from '@/lib/build-day-route'
import {
  findSavedRouteMatch,
  getSavedRoutes,
  isDayRouteSaved,
  rehydrateDayRoute,
  removeSavedRoute,
  saveDayRoute,
  type SavedDayRoute,
} from '@/lib/saved-routes-storage'
import { useAuth } from '@/contexts/useAuth'
import { useI18n } from '@/hooks/useI18n'
import {
  findPlannerRecommendation,
  type PlannerRecommendation,
} from '@/lib/planner-recommendations'
import { motionGpuClass, spring, tween } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { MoodPreset, ZoneKey } from '@/types/user'
import type { NoraMapHandle } from './map-types'

type MapForDwell = NoraMapHandle

const ROUTE_MARKER_COLORS = ['#f59e0b', '#fb923c', '#fbbf24', '#a3e635'] as const

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
  const searchOpenDefault = searchParams?.get('search') === 'open'
  const routeOpenDefault = searchParams?.get('route') === 'open'
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
  const [dayRoute, setDayRoute] = useState<DayRoute | null>(null)
  const [savedRoutes, setSavedRoutes] = useState<SavedDayRoute[]>([])
  const [insightZone, setInsightZone] = useState<'home' | 'work' | null>(null)
  const [placeDetailOpen, setPlaceDetailOpen] = useState(false)

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
    const out: {
      id: string
      lng: number
      lat: number
      color?: string
      label?: number
    }[] = []
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
    if (dayRoute) {
      dayRoute.stops.forEach((stop, i) => {
        out.push({
          id: `route-${stop.id}`,
          lng: stop.lng,
          lat: stop.lat,
          color: ROUTE_MARKER_COLORS[i % ROUTE_MARKER_COLORS.length],
          label: i + 1,
        })
      })
    } else if (focusPlace) {
      out.push({
        id: `plan-${focusPlace.id}`,
        lng: focusPlace.lng,
        lat: focusPlace.lat,
        color: '#f59e0b',
      })
    }
    return out
  }, [user?.zones, focusPlace, dayRoute])

  const routePath = useMemo(
    () =>
      dayRoute?.stops.map((s) => ({ lng: s.lng, lat: s.lat })) ?? undefined,
    [dayRoute],
  )

  const activeSavedRouteId = useMemo(() => {
    if (!dayRoute || !user?.id) return null
    if (savedRoutes.some((r) => r.id === dayRoute.id)) return dayRoute.id
    return findSavedRouteMatch(user.id, dayRoute)?.id ?? null
  }, [dayRoute, savedRoutes, user?.id])

  const dayRouteIsSaved = useMemo(
    () => (user?.id && dayRoute ? isDayRouteSaved(user.id, dayRoute) : false),
    [user?.id, dayRoute, savedRoutes],
  )

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

  const flyToRoute = useCallback((route: DayRoute) => {
    const map = mapRef.current
    if (!map || !route.stops.length) return
    if (route.stops.length === 1) {
      flyToPlace(route.stops[0]!)
      return
    }
    const lngs = route.stops.map((s) => s.lng)
    const lats = route.stops.map((s) => s.lat)
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 88, duration: 1400, pitch: 48, maxZoom: 15.5 },
    )
  }, [flyToPlace])

  const handleSelectPlace = useCallback(
    (rec: PlannerRecommendation) => {
      setDayRoute(null)
      setFocusPlaceId(rec.id)
      setInsightZone(null)
      flyToPlace(rec)
    },
    [flyToPlace],
  )

  const handleRouteBuilt = useCallback(
    (route: DayRoute) => {
      setDayRoute(route)
      setFocusPlaceId(null)
      focusPlaceRef.current = null
      setInsightZone(null)
      flyToRoute(route)
    },
    [flyToRoute],
  )

  const handleSelectRouteStop = useCallback(
    (stopId: string) => {
      const stop = dayRoute?.stops.find((s) => s.id === stopId)
      if (!stop) return
      setFocusPlaceId(stop.id)
      flyToPlace(stop)
    },
    [dayRoute, flyToPlace],
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

  useEffect(() => {
    if (!user?.id) {
      setSavedRoutes([])
      return
    }
    setSavedRoutes(getSavedRoutes(user.id))
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const refresh = () => setSavedRoutes(getSavedRoutes(user.id))
    window.addEventListener('nora-routes-change', refresh)
    return () => window.removeEventListener('nora-routes-change', refresh)
  }, [user?.id])

  const handleSaveDayRoute = useCallback(() => {
    if (!user?.id || !dayRoute) return false
    return saveDayRoute(user.id, dayRoute)
  }, [user?.id, dayRoute])

  const handleSelectSavedRoute = useCallback(
    (saved: SavedDayRoute) => {
      const route = rehydrateDayRoute(saved, locale)
      setDayRoute(route)
      setFocusPlaceId(null)
      focusPlaceRef.current = null
      setInsightZone(null)
      flyToRoute(route)
    },
    [flyToRoute, locale],
  )

  const handleDeleteSavedRoute = useCallback(
    (routeId: string) => {
      if (!user?.id) return
      removeSavedRoute(user.id, routeId)
      if (dayRoute?.id === routeId) setDayRoute(null)
    },
    [user?.id, dayRoute?.id],
  )

  return (
    <>
      <MapCanvas onMap={onMap} markers={markers} routePath={routePath} />

      <MapTopBar
        defaultSearchOpen={searchOpenDefault}
        defaultRouteOpen={routeOpenDefault}
        mood={mood}
        budgetIdx={budgetIdx}
        mbti={user?.mbti ?? ''}
        onMoodChange={setMood}
        onBudgetChange={setBudgetIdx}
        onRouteBuilt={handleRouteBuilt}
      />

      <PlannerHubPanel
        mood={mood}
        onMoodChange={setMood}
        budgetIdx={budgetIdx}
        onBudgetChange={setBudgetIdx}
        mbti={user?.mbti ?? ''}
        defaultOpen={plannerOpenDefault}
        onOpenChange={setStatePanelOpen}
        onSelectPlace={handleSelectPlace}
        savedRoutes={user?.id ? savedRoutes : []}
        activeRouteId={user?.id ? activeSavedRouteId : null}
        onSelectSavedRoute={user?.id ? handleSelectSavedRoute : undefined}
        onDeleteSavedRoute={user?.id ? handleDeleteSavedRoute : undefined}
      />

      <AnimatePresence>
        {dayRoute ? (
          <DayRouteCard
            key={dayRoute.id}
            route={dayRoute}
            onSelectStop={handleSelectRouteStop}
            onSave={user?.id ? handleSaveDayRoute : undefined}
            isSaved={dayRouteIsSaved}
            onClear={() => {
              setDayRoute(null)
              setFocusPlaceId(null)
              focusPlaceRef.current = null
            }}
            className={cn(
              'fixed z-[25] w-full max-w-[min(20rem,92vw)]',
              statePanelOpen
                ? 'left-[max(0.5rem,env(safe-area-inset-left))] right-[max(calc(min(20rem,92vw)+0.75rem),env(safe-area-inset-right))]'
                : 'inset-x-[max(0.5rem,env(safe-area-inset-left))] mx-auto',
              'bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))]',
            )}
          />
        ) : focusPlace ? (
          <motion.div
            key={`${focusPlace.id}-${locale}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={tween.medium}
            className={cn(
              'motion-gpu',
              motionGpuClass,
              'pointer-events-auto fixed z-[25] w-full max-w-[min(18rem,88vw)]',
              statePanelOpen
                ? 'left-[max(0.5rem,env(safe-area-inset-left))] right-[max(calc(min(20rem,92vw)+0.75rem),env(safe-area-inset-right))]'
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
              <div className="mt-2">
                <PlaceFeedbackPanel placeId={focusPlace.id} compact />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="text-xs font-medium text-sky-400 hover:underline"
                  onClick={() => setPlaceDetailOpen(true)}
                >
                  {t('places.details')}
                </button>
                <button
                  type="button"
                  className="text-xs text-[var(--nora-text-muted)] hover:text-[var(--nora-text)]"
                  onClick={() => {
                    focusPlaceRef.current = null
                    setFocusPlaceId(null)
                  }}
                >
                  {t('planner.hideMarker')}
                </button>
              </div>
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
            transition={spring.sheet}
            className={cn(
              'motion-gpu pointer-events-none fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-[max(0.5rem,env(safe-area-inset-right))] z-30',
              motionGpuClass,
              statePanelOpen
                ? 'right-[max(calc(min(20rem,92vw)+0.5rem),env(safe-area-inset-right))]'
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

      <PlaceMapDialog
        open={placeDetailOpen}
        onOpenChange={setPlaceDetailOpen}
        place={focusPlace}
      />
    </>
  )
}
