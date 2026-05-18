import type { Locale } from '@/i18n/config'
import { normalizeBudgetIndex } from '@/lib/daily-budget'
import type { MbtiId } from '@/lib/mbti'
import { localizePlannerPool } from '@/i18n/planner-text'
import { filterRecommendationsByAge } from '@/lib/age-policy'
import { getDislikedPlaceIds } from '@/lib/place-preferences-storage'
import {
  clampStopCount,
  filterByRouteArea,
  isRouteAreaKey,
  isRouteDayPeriod,
  isRouteVibe,
  legacyMoodToVibe,
  routeAreaLabel,
  vibeToPlannerMood,
  type RouteAreaKey,
  type RouteDayPeriod,
  type RouteStopCount,
  type RouteVibe,
} from '@/lib/route-intents'
import {
  getRecommendationsForMoodAndBudget,
  normalizePlannerMood,
  PLANNER_BY_MOOD,
  type PlannerMood,
  type PlannerRecommendation,
} from '@/lib/planner-recommendations'

/** @deprecated используйте dayPeriod + stopCount */
export type RouteTimeSlot = 'morning' | 'afternoon' | 'evening' | 'full'

export type DayRouteInput = {
  vibe: RouteVibe
  /** Бюджет для подбора (для группы — effective/min) */
  budgetIdx: number
  dayPeriod: RouteDayPeriod
  stopCount: number
  areaKey: RouteAreaKey
  areaCustom: string
  mbti?: MbtiId | ''
  birthYear?: number | null
  userId?: string
  /** Учитывать дизлайки всех участников */
  dislikeUserIds?: string[]
  groupSize?: number
  participantIds?: string[]
  groupBudgetAvg?: number
  organizerBudgetIdx?: number
}

export type DayRoute = {
  id: string
  vibe: RouteVibe
  /** Для подбора мест и обратной совместимости */
  mood: PlannerMood
  dayPeriod: RouteDayPeriod
  stopCount: RouteStopCount
  areaKey: RouteAreaKey
  area: string
  /** @deprecated */
  timeSlot?: RouteTimeSlot
  stops: PlannerRecommendation[]
  totalDurationMin: number
  groupSize?: number
  participantIds?: string[]
  groupBudgetAvg?: number
  groupBudgetEffective?: number
  organizerBudgetIdx?: number
}

function parseDurationMinutes(s: string): number {
  const h = s.match(/(\d+)\s*ч/)
  const m = s.match(/(\d+)\s*мин/)
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0)
}

function dist(
  a: { lng: number; lat: number },
  b: { lng: number; lat: number },
) {
  const dx = (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180)
  const dy = a.lat - b.lat
  return Math.hypot(dx, dy)
}

function orderByProximity(
  stops: PlannerRecommendation[],
): PlannerRecommendation[] {
  if (stops.length <= 1) return stops
  const rem = [...stops]
  const ordered: PlannerRecommendation[] = []
  const cx = rem.reduce((s, p) => s + p.lng, 0) / rem.length
  const cy = rem.reduce((s, p) => s + p.lat, 0) / rem.length
  rem.sort(
    (a, b) =>
      dist(a, { lng: cx, lat: cy }) - dist(b, { lng: cx, lat: cy }),
  )
  ordered.push(rem.shift()!)
  while (rem.length) {
    const last = ordered[ordered.length - 1]!
    rem.sort((a, b) => dist(a, last) - dist(b, last))
    ordered.push(rem.shift()!)
  }
  return ordered
}

function uniqueById(items: PlannerRecommendation[]) {
  const seen = new Set<string>()
  return items.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
}

/** Собирает маршрут: намерение дня, бюджет, время, число мест и район. */
export function buildDayRoute(
  input: DayRouteInput,
  locale: Locale = 'ru',
): DayRoute | null {
  const vibe = input.vibe
  const mood = vibeToPlannerMood(vibe)
  const budget = normalizeBudgetIndex(input.budgetIdx)
  const birthYear = input.birthYear ?? null
  const stopCount = clampStopCount(input.stopCount)
  const areaKey = input.areaKey
  const pools = localizePlannerPool(PLANNER_BY_MOOD, locale)
  const affordable = filterRecommendationsByAge(
    pools[mood].filter((r) => r.budgetTier <= budget),
    birthYear,
  )

  const dislikeIds = [
    ...(input.dislikeUserIds ?? []),
    ...(input.userId ? [input.userId] : []),
  ]
  const disliked = new Set<string>()
  for (const uid of [...new Set(dislikeIds)]) {
    for (const id of getDislikedPlaceIds(uid)) disliked.add(id)
  }

  let candidates = uniqueById([
    ...getRecommendationsForMoodAndBudget(
      mood,
      input.budgetIdx,
      locale,
      birthYear,
      input.userId,
      input.mbti,
    ),
    ...affordable,
  ]).filter((r) => !disliked.has(r.id))

  candidates = filterByRouteArea(candidates, areaKey, input.areaCustom)
  if (!candidates.length) candidates = affordable.filter((r) => !disliked.has(r.id))
  if (!candidates.length) return null

  const stops = orderByProximity(candidates).slice(0, stopCount)
  if (!stops.length) return null

  const groupSize = input.groupSize ?? 1
  const participantIds = input.participantIds ?? []

  return {
    id: `route-${Date.now()}`,
    vibe,
    mood,
    dayPeriod: input.dayPeriod,
    stopCount,
    areaKey,
    area: routeAreaLabel(areaKey, input.areaCustom, locale),
    stops,
    totalDurationMin: stops.reduce(
      (sum, r) => sum + parseDurationMinutes(r.duration),
      0,
    ),
    ...(groupSize > 1
      ? {
          groupSize,
          participantIds,
          groupBudgetAvg: input.groupBudgetAvg,
          groupBudgetEffective: budget,
          organizerBudgetIdx: input.organizerBudgetIdx,
        }
      : {}),
  }
}

export function formatRouteDuration(totalMin: number, locale: Locale): string {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (locale === 'en') {
    if (h && m) return `${h} h ${m} min`
    if (h) return `${h} h`
    return `${m} min`
  }
  if (h && m) return `${h} ч ${m} мин`
  if (h) return `${h} ч`
  return `${m} мин`
}

/** Нормализация старых маршрутов из localStorage */
export function normalizeDayRouteFields(
  raw: Record<string, unknown>,
  locale: Locale,
): Pick<
  DayRoute,
  | 'vibe'
  | 'mood'
  | 'dayPeriod'
  | 'stopCount'
  | 'areaKey'
  | 'area'
  | 'timeSlot'
  | 'groupSize'
  | 'participantIds'
  | 'groupBudgetAvg'
  | 'groupBudgetEffective'
  | 'organizerBudgetIdx'
> | null {
  const legacySlot = raw.timeSlot
  const legacyMood = raw.mood

  let vibe: RouteVibe =
    isRouteVibe(raw.vibe) ? raw.vibe : 'calm'
  let mood: PlannerMood = vibeToPlannerMood(vibe)

  if (!isRouteVibe(raw.vibe) && typeof legacyMood === 'string') {
    const m = normalizePlannerMood(legacyMood as '')
    mood = m
    vibe = legacyMoodToVibe(m)
  }

  let dayPeriod: RouteDayPeriod = isRouteDayPeriod(raw.dayPeriod)
    ? raw.dayPeriod
    : 'afternoon'

  if (!isRouteDayPeriod(raw.dayPeriod) && typeof legacySlot === 'string') {
    if (legacySlot === 'morning') dayPeriod = 'morning'
    else if (legacySlot === 'evening') dayPeriod = 'evening'
    else if (legacySlot === 'full') dayPeriod = 'afternoon'
    else dayPeriod = 'afternoon'
  }

  const stopCount = clampStopCount(
    Number(raw.stopCount) ||
      (legacySlot === 'morning'
        ? 2
        : legacySlot === 'evening'
          ? 3
          : legacySlot === 'full'
            ? 4
            : 3),
  )

  const areaKey: RouteAreaKey = isRouteAreaKey(raw.areaKey)
    ? raw.areaKey
    : 'custom'
  const areaCustom =
    areaKey === 'custom' && typeof raw.area === 'string' ? raw.area : ''
  const area =
    typeof raw.area === 'string' && raw.area.trim()
      ? raw.area.trim()
      : routeAreaLabel(areaKey, areaCustom, locale)

  const groupSize =
    typeof raw.groupSize === 'number' && raw.groupSize > 1
      ? Math.min(12, Math.round(raw.groupSize))
      : 1
  const participantIds = Array.isArray(raw.participantIds)
    ? raw.participantIds.filter((id): id is string => typeof id === 'string')
    : []

  return {
    vibe,
    mood,
    dayPeriod,
    stopCount,
    areaKey,
    area,
    timeSlot:
      typeof legacySlot === 'string' &&
      ['morning', 'afternoon', 'evening', 'full'].includes(legacySlot)
        ? (legacySlot as RouteTimeSlot)
        : undefined,
    groupSize: groupSize > 1 ? groupSize : undefined,
    participantIds: groupSize > 1 ? participantIds : undefined,
    groupBudgetAvg:
      typeof raw.groupBudgetAvg === 'number' ? raw.groupBudgetAvg : undefined,
    groupBudgetEffective:
      typeof raw.groupBudgetEffective === 'number'
        ? raw.groupBudgetEffective
        : undefined,
    organizerBudgetIdx:
      typeof raw.organizerBudgetIdx === 'number'
        ? raw.organizerBudgetIdx
        : undefined,
  }
}
