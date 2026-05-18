import type { Locale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'
import type {
  PlannerMood,
  PlannerRecommendation,
} from '@/lib/planner-recommendations'

/** Как пользователь хочет провести запланированный день (не настроение «сейчас»). */
export const ROUTE_VIBES = [
  'calm',
  'social',
  'romantic',
  'family',
  'active',
  'cozy',
] as const

export type RouteVibe = (typeof ROUTE_VIBES)[number]

export const ROUTE_DAY_PERIODS = [
  'morning',
  'afternoon',
  'evening',
  'night',
] as const

export type RouteDayPeriod = (typeof ROUTE_DAY_PERIODS)[number]

export const ROUTE_STOP_COUNTS = [1, 2, 3, 4, 5] as const
export type RouteStopCount = (typeof ROUTE_STOP_COUNTS)[number]

export const ROUTE_AREA_KEYS = [
  'center',
  'osh',
  'countryside',
  'parks',
  'north',
  'south',
  'custom',
] as const

export type RouteAreaKey = (typeof ROUTE_AREA_KEYS)[number]

const AREA_SEARCH: Record<
  Exclude<RouteAreaKey, 'custom'>,
  string[]
> = {
  center: ['чуй', 'ала-тоо', 'центр', 'center', 'downtown', 'площадь'],
  osh: ['ош', 'айни', 'osh', 'базар'],
  countryside: ['загород', 'кашка', 'иссык', 'пригород', 'село', 'озеро'],
  parks: ['парк', 'park', 'дубов', 'бульвар', 'эркиндик'],
  north: ['север', 'медер', 'meder', 'джал'],
  south: ['юг', 'south', 'кара'],
}

/** Пул рекомендаций планера для подбора остановок маршрута. */
export function vibeToPlannerMood(vibe: RouteVibe): PlannerMood {
  const map: Record<RouteVibe, PlannerMood> = {
    calm: 'calm',
    social: 'energy',
    romantic: 'calm',
    family: 'calm',
    active: 'energy',
    cozy: 'tired',
  }
  return map[vibe]
}

export function getRouteVibeMeta(locale: Locale) {
  const v = getMessages(locale).routeVibes
  return {
    calm: { emoji: '🧘', label: v.calm.label, hint: v.calm.hint },
    social: { emoji: '🎉', label: v.social.label, hint: v.social.hint },
    romantic: { emoji: '💫', label: v.romantic.label, hint: v.romantic.hint },
    family: { emoji: '👨‍👩‍👧', label: v.family.label, hint: v.family.hint },
    active: { emoji: '⚡', label: v.active.label, hint: v.active.hint },
    cozy: { emoji: '☕', label: v.cozy.label, hint: v.cozy.hint },
  } satisfies Record<
    RouteVibe,
    { emoji: string; label: string; hint: string }
  >
}

export function getRoutePeriodMeta(locale: Locale) {
  const p = getMessages(locale).routePeriods
  return {
    morning: { label: p.morning, hint: p.morningHint },
    afternoon: { label: p.afternoon, hint: p.afternoonHint },
    evening: { label: p.evening, hint: p.eveningHint },
    night: { label: p.night, hint: p.nightHint },
  }
}

export function getRouteAreaMeta(locale: Locale) {
  const a = getMessages(locale).routeAreas
  return {
    center: a.center,
    osh: a.osh,
    countryside: a.countryside,
    parks: a.parks,
    north: a.north,
    south: a.south,
    custom: a.custom,
  }
}

export function routeAreaLabel(
  areaKey: RouteAreaKey,
  customText: string,
  locale: Locale,
): string {
  if (areaKey === 'custom') return customText.trim()
  return getRouteAreaMeta(locale)[areaKey]
}

export function filterByRouteArea(
  pool: PlannerRecommendation[],
  areaKey: RouteAreaKey,
  customText: string,
): PlannerRecommendation[] {
  if (areaKey === 'custom') {
    const q = customText.trim().toLowerCase()
    if (!q) return pool
    return pool.filter((r) =>
      `${r.title} ${r.place} ${r.address}`.toLowerCase().includes(q),
    )
  }
  const keys = AREA_SEARCH[areaKey]
  const matched = pool.filter((r) => {
    const hay = `${r.title} ${r.place} ${r.address}`.toLowerCase()
    return keys.some((k) => hay.includes(k))
  })
  return matched.length ? matched : pool
}

/** Старые сохранённые маршруты: mood → vibe */
export function legacyMoodToVibe(mood: PlannerMood): RouteVibe {
  const map: Record<PlannerMood, RouteVibe> = {
    calm: 'calm',
    energy: 'social',
    tired: 'cozy',
    anxious: 'calm',
  }
  return map[mood]
}

export function isRouteVibe(v: unknown): v is RouteVibe {
  return typeof v === 'string' && ROUTE_VIBES.includes(v as RouteVibe)
}

export function isRouteDayPeriod(v: unknown): v is RouteDayPeriod {
  return typeof v === 'string' && ROUTE_DAY_PERIODS.includes(v as RouteDayPeriod)
}

export function isRouteAreaKey(v: unknown): v is RouteAreaKey {
  return typeof v === 'string' && ROUTE_AREA_KEYS.includes(v as RouteAreaKey)
}

export function clampStopCount(n: number): RouteStopCount {
  const v = Math.round(n)
  if (v <= 1) return 1
  if (v >= 5) return 5
  return v as RouteStopCount
}
