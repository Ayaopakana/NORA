import type { Locale } from '@/i18n/config'
import {
  clampStopCount,
  routeAreaSeed,
  type RouteStopCount,
} from '@/lib/route-intents'
import type { DayRoute } from '@/lib/build-day-route'
import { parseDurationMinutes } from '@/lib/build-day-route'
import { optimizeWalkingOrder } from '@/lib/optimize-route-order'
import { withPlaceCoordinates } from '@/lib/place-coordinates'
import type { PlannerRecommendation } from '@/lib/planner-recommendations'

export const MAX_ROUTE_STOPS = 12

const DEFAULT_STOP_DURATION: Record<Locale, string> = {
  ru: '45 мин',
  en: '45 min',
  ky: '45 мүн',
  ko: '45분',
}

export function routeDisplayTitle(
  route: DayRoute,
  fallback: string,
): string {
  const name = route.name?.trim()
  if (name) return name
  return fallback
}

export function recalcRouteTotals(route: DayRoute): DayRoute {
  const stops = route.stops
  return {
    ...route,
    stopCount: clampStopCount(stops.length) as RouteStopCount,
    totalDurationMin: stops.reduce(
      (sum, s) => sum + parseDurationMinutes(s.duration),
      0,
    ),
  }
}

export function removeRouteStop(route: DayRoute, stopId: string): DayRoute | null {
  const stops = route.stops.filter((s) => s.id !== stopId)
  if (!stops.length || stops.length === route.stops.length) return null
  const center = routeAreaSeed(route.areaKey)
  const ordered =
    stops.length >= 2 ? optimizeWalkingOrder(stops, center) : stops
  return recalcRouteTotals({ ...route, stops: ordered })
}

export function addRouteStop(
  route: DayRoute,
  stop: PlannerRecommendation,
): DayRoute | null {
  if (route.stops.some((s) => s.id === stop.id)) return null
  if (route.stops.length >= MAX_ROUTE_STOPS) return null
  const next = withPlaceCoordinates(stop)
  const stops = [...route.stops, next]
  const center = routeAreaSeed(route.areaKey)
  const ordered =
    stops.length >= 2 ? optimizeWalkingOrder(stops, center) : stops
  return recalcRouteTotals({ ...route, stops: ordered })
}

export function createCustomStop(
  input: {
    title: string
    place: string
    address: string
    lng: number
    lat: number
  },
  locale: Locale,
): PlannerRecommendation {
  const place = input.place.trim()
  const title = input.title.trim() || place
  return {
    id: `custom-${crypto.randomUUID()}`,
    title,
    place,
    address: input.address.trim() || place,
    lng: input.lng,
    lat: input.lat,
    duration: DEFAULT_STOP_DURATION[locale] ?? DEFAULT_STOP_DURATION.ru,
    budgetTier: 1,
    badge: '',
  }
}

export function patchRouteName(route: DayRoute, name: string): DayRoute {
  const trimmed = name.trim()
  return {
    ...route,
    name: trimmed || undefined,
  }
}
