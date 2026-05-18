import type { PlacePreference } from '@/lib/place-preferences-storage'
import type { PlaceReview } from '@/lib/place-reviews-storage'
import { apiFetch } from '@/api/client'
import { parseJson } from '@/api/json'

export async function apiGetPlaceReviews(placeId: string): Promise<{
  reviews: PlaceReview[]
  avg: number | null
}> {
  const res = await apiFetch(`/places/${encodeURIComponent(placeId)}/reviews`)
  return parseJson(res)
}

export async function apiAddPlaceReview(input: {
  placeId: string
  rating: number
  text: string
}): Promise<PlaceReview> {
  const res = await apiFetch(
    `/places/${encodeURIComponent(input.placeId)}/reviews`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: input.rating,
        text: input.text,
      }),
    },
  )
  const data = await parseJson<{ review: PlaceReview }>(res)
  return data.review
}

export async function apiGetPlacePreference(
  placeId: string,
): Promise<PlacePreference | null> {
  const res = await apiFetch(
    `/places/${encodeURIComponent(placeId)}/preference`,
  )
  const data = await parseJson<{ value: PlacePreference | null }>(res)
  return data.value
}

export async function apiSetPlacePreference(
  placeId: string,
  value: PlacePreference | null,
): Promise<void> {
  const res = await apiFetch(
    `/places/${encodeURIComponent(placeId)}/preference`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    },
  )
  await parseJson(res)
}

export async function apiGetDislikedPlaceIds(): Promise<string[]> {
  const res = await apiFetch('/places/preferences/disliked')
  const data = await parseJson<{ ids: string[] }>(res)
  return data.ids
}
