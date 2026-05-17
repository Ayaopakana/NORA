import type { PlannerRecommendation } from '@/lib/planner-recommendations'

export type VenueTag =
  | 'cafe'
  | 'park'
  | 'culture'
  | 'food'
  | 'market'
  | 'nightlife'
  | 'bar'
  | 'family'
  | 'wellness'

const ADULT_TAGS: VenueTag[] = ['nightlife', 'bar']

export function getAgeFromBirthYear(birthYear: number | null): number | null {
  if (birthYear === null || !Number.isFinite(birthYear)) return null
  const year = Math.round(birthYear)
  const now = new Date().getFullYear()
  if (year < 1920 || year > now) return null
  const age = now - year
  return age >= 0 && age <= 120 ? age : null
}

export function isValidBirthYear(year: number): boolean {
  const age = getAgeFromBirthYear(year)
  return age !== null && age >= 13 && age <= 100
}

/** Фильтр рекомендаций по возрасту (до подключения ИИ на бэкенде). */
export function isVenueAllowedForAge(
  rec: PlannerRecommendation,
  birthYear: number | null,
): boolean {
  const age = getAgeFromBirthYear(birthYear)
  if (age === null) return true

  const tags = rec.venueTags ?? []
  const minAge =
    rec.minAge ??
    (tags.some((t) => ADULT_TAGS.includes(t)) ? 18 : 0)

  if (age < minAge) return false
  if (age < 18 && tags.some((t) => ADULT_TAGS.includes(t))) return false
  if (age >= 60 && tags.includes('nightlife')) return false
  if (age >= 65 && tags.includes('bar')) return false

  return true
}

export function filterRecommendationsByAge(
  items: PlannerRecommendation[],
  birthYear: number | null,
): PlannerRecommendation[] {
  return items.filter((r) => isVenueAllowedForAge(r, birthYear))
}
