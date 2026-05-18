import {
  getAgeFromBirthDate,
  isVenueAllowedForAge,
  type BirthDateInput,
} from '@/lib/age-policy'
import type { PlannerRecommendation } from '@/lib/planner-recommendations'
import type { RouteDayPeriod, RouteVibe } from '@/lib/route-intents'

export type RouteVenueFilterProfile = {
  vibe: RouteVibe
  dayPeriod: RouteDayPeriod
}

export type PoiCatalogKind =
  | 'park'
  | 'hotel'
  | 'cafe'
  | 'rest'
  | 'bar'
  | 'mall'
  | 'market'
  | 'culture'
  | 'fun'
  | 'work'
  | 'other'

const WORK_TEXT =
  /рабоч|коворк|cowork|офис|office|бизнес.?центр|impact hub|fablab|kitap\.kg|study hub|учебн|библиотек/i

const ADULT_TEXT =
  /\b(бар|bar|клуб|club|паб|pub|nightclub|night\s*club|18\+|вечерн\w*\s+тусов)/i

/** Категория из id каталога `poi-{kind}-…`. */
export function poiKindFromId(id: string): PoiCatalogKind {
  const m = id.match(/^poi-([^-]+)/)
  const raw = m?.[1]
  const kinds: PoiCatalogKind[] = [
    'park',
    'hotel',
    'cafe',
    'rest',
    'bar',
    'mall',
    'market',
    'culture',
    'fun',
    'work',
    'other',
  ]
  if (raw && kinds.includes(raw as PoiCatalogKind)) return raw as PoiCatalogKind
  return 'other'
}

function placeHaystack(place: PlannerRecommendation): string {
  return `${place.id} ${place.title} ${place.place} ${place.badge ?? ''} ${place.address ?? ''}`.toLowerCase()
}

export function isWorkVenue(place: PlannerRecommendation): boolean {
  if (poiKindFromId(place.id) === 'work') return true
  return WORK_TEXT.test(placeHaystack(place))
}

export function looksLikeAdultVenue(place: PlannerRecommendation): boolean {
  if (poiKindFromId(place.id) === 'bar') return true
  const tags = place.venueTags ?? []
  if (tags.includes('bar') || tags.includes('nightlife')) return true
  if (place.minAge !== undefined && place.minAge >= 18) return true
  return ADULT_TEXT.test(placeHaystack(place))
}

const VIBE_BLOCKED_KIND: Record<RouteVibe, PoiCatalogKind[]> = {
  romantic: ['work', 'bar', 'mall', 'hotel', 'market'],
  calm: ['work', 'bar', 'mall', 'hotel'],
  cozy: ['work', 'bar', 'mall', 'hotel'],
  family: ['work', 'bar', 'hotel'],
  social: ['work', 'hotel'],
  active: ['work', 'bar', 'hotel'],
}

const PERIOD_BLOCKED_KIND: Record<RouteDayPeriod, PoiCatalogKind[]> = {
  morning: ['bar', 'hotel'],
  afternoon: ['bar'],
  evening: [],
  night: [],
}

function barAllowedForProfile(
  profile: RouteVenueFilterProfile,
  birth: BirthDateInput,
): boolean {
  if (profile.vibe !== 'social') return false
  if (profile.dayPeriod !== 'evening' && profile.dayPeriod !== 'night') return false
  const age = getAgeFromBirthDate(birth)
  if (age !== null && age < 18) return false
  return true
}

/**
 * Подходит ли место под вайб, время дня и досуг (не работа/не ТЦ для романтики и т.д.).
 */
export function isVenueSuitableForRoute(
  place: PlannerRecommendation,
  profile: RouteVenueFilterProfile,
  birth: BirthDateInput = null,
): boolean {
  if (!isVenueAllowedForAge(place, birth)) return false

  const kind = poiKindFromId(place.id)
  const hay = placeHaystack(place)

  if (isWorkVenue(place)) return false

  if (VIBE_BLOCKED_KIND[profile.vibe].includes(kind)) return false
  if (PERIOD_BLOCKED_KIND[profile.dayPeriod].includes(kind)) return false

  if (kind === 'bar' || looksLikeAdultVenue(place)) {
    if (!barAllowedForProfile(profile, birth)) return false
  }

  if (profile.vibe === 'romantic' && WORK_TEXT.test(hay)) return false
  if (
    (profile.vibe === 'romantic' || profile.vibe === 'calm' || profile.vibe === 'cozy') &&
    /\b(шопинг|торговый центр|mall|tsum|dordoi plaza)\b/i.test(hay)
  ) {
    return false
  }

  const age = getAgeFromBirthDate(birth)
  if (age !== null && age < 18) {
    if (kind === 'bar' || looksLikeAdultVenue(place)) return false
  }

  return true
}

export function filterPlacesForRoute(
  places: PlannerRecommendation[],
  profile: RouteVenueFilterProfile,
  birth: BirthDateInput = null,
): PlannerRecommendation[] {
  return places.filter((p) => isVenueSuitableForRoute(p, profile, birth))
}
