import type { Locale } from '@/i18n/config'
import { normalizeBudgetIndex } from '@/lib/daily-budget'
import type { MbtiId } from '@/lib/mbti'
import { localizePlannerPool } from '@/i18n/planner-text'
import { filterRecommendationsByAge } from '@/lib/age-policy'
import {
  getRecommendationsForMoodAndBudget,
  normalizePlannerMood,
  PLANNER_BY_MOOD,
  type PlannerMood,
  type PlannerRecommendation,
} from '@/lib/planner-recommendations'
import type { MoodPreset } from '@/types/user'

export type RouteTimeSlot = 'morning' | 'afternoon' | 'evening' | 'full'

export type DayRouteInput = {
  mood: MoodPreset
  budgetIdx: number
  timeSlot: RouteTimeSlot
  area: string
  mbti?: MbtiId | ''
  birthYear?: number | null
}

export type DayRoute = {
  id: string
  mood: PlannerMood
  timeSlot: RouteTimeSlot
  area: string
  stops: PlannerRecommendation[]
  totalDurationMin: number
}

const STOP_COUNT: Record<RouteTimeSlot, number> = {
  morning: 2,
  afternoon: 3,
  evening: 3,
  full: 4,
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

/**
 * Демо-порядок остановок (ближайший сосед).
 * Позже заменится бэкендом: OSRM/GraphHopper, дороги, трафик, окна времени.
 */
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

function filterByArea(
  pool: PlannerRecommendation[],
  area: string,
): PlannerRecommendation[] {
  const q = area.trim().toLowerCase()
  if (!q) return pool
  return pool.filter((r) =>
    `${r.title} ${r.place} ${r.address}`.toLowerCase().includes(q),
  )
}

function uniqueById(items: PlannerRecommendation[]) {
  const seen = new Set<string>()
  return items.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
}

/** Собирает маршрут на день по настроению, бюджету, времени и району. */
export function buildDayRoute(
  input: DayRouteInput,
  locale: Locale = 'ru',
): DayRoute | null {
  const mood = normalizePlannerMood(input.mood)
  const budget = normalizeBudgetIndex(input.budgetIdx)
  const birthYear = input.birthYear ?? null
  const pools = localizePlannerPool(PLANNER_BY_MOOD, locale)
  const affordable = filterRecommendationsByAge(
    pools[mood].filter((r) => r.budgetTier <= budget),
    birthYear,
  )

  let candidates = uniqueById([
    ...getRecommendationsForMoodAndBudget(
      mood,
      input.budgetIdx,
      locale,
      birthYear,
    ),
    ...affordable,
  ])

  const byArea = filterByArea(candidates, input.area)
  if (byArea.length) candidates = byArea
  else if (input.area.trim()) {
    const areaOnly = filterByArea(affordable, input.area)
    if (areaOnly.length) candidates = areaOnly
  }

  if (!candidates.length) candidates = affordable
  if (!candidates.length) return null

  const count = STOP_COUNT[input.timeSlot]
  const stops = orderByProximity(candidates).slice(0, count)
  if (!stops.length) return null

  return {
    id: `route-${Date.now()}`,
    mood,
    timeSlot: input.timeSlot,
    area: input.area.trim(),
    stops,
    totalDurationMin: stops.reduce(
      (sum, r) => sum + parseDurationMinutes(r.duration),
      0,
    ),
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
