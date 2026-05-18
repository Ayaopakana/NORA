const REVIEWS_KEY = 'nora_place_reviews'
const SEEDED_KEY = 'nora_place_reviews_seeded'

export type PlaceReview = {
  id: string
  placeId: string
  userId: string
  nickname: string
  rating: number
  text: string
  at: number
}

function readReviews(): PlaceReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PlaceReview[]
  } catch {
    return []
  }
}

function writeReviews(reviews: PlaceReview[]) {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
  } catch {
    /* quota */
  }
}

function ensureDemoReviews() {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(SEEDED_KEY)) return
  const seed: PlaceReview[] = [
    {
      id: 'rev-seed-1',
      placeId: 'calm-1',
      userId: 'demo-4',
      nickname: 'kirill_food',
      rating: 5,
      text: 'Тихо утром, удобно работать с ноутбуком.',
      at: Date.now() - 86400000 * 3,
    },
    {
      id: 'rev-seed-2',
      placeId: 'calm-1',
      userId: 'demo-3',
      nickname: 'darya_calm',
      rating: 4,
      text: 'Мягкий свет и спокойная музыка.',
      at: Date.now() - 86400000 * 5,
    },
    {
      id: 'rev-seed-3',
      placeId: 'energy-1',
      userId: 'demo-2',
      nickname: 'max_runner',
      rating: 5,
      text: 'Живо и вкусно — идеально после пробежки.',
      at: Date.now() - 86400000 * 2,
    },
  ]
  writeReviews(seed)
  localStorage.setItem(SEEDED_KEY, '1')
}

export function notifyPlaceFeedbackChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nora-place-feedback-change'))
  }
}

export function getReviewsForPlace(placeId: string): PlaceReview[] {
  ensureDemoReviews()
  return readReviews()
    .filter((r) => r.placeId === placeId)
    .sort((a, b) => b.at - a.at)
}

export function getAverageRating(placeId: string): number | null {
  const list = getReviewsForPlace(placeId)
  if (!list.length) return null
  const sum = list.reduce((s, r) => s + r.rating, 0)
  return Math.round((sum / list.length) * 10) / 10
}

export function addPlaceReview(input: {
  placeId: string
  userId: string
  nickname: string
  rating: number
  text: string
}): PlaceReview {
  ensureDemoReviews()
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)))
  const text = input.text.trim()
  if (!text) throw new Error('empty review')

  const review: PlaceReview = {
    id: `rev-${Date.now()}`,
    placeId: input.placeId,
    userId: input.userId,
    nickname: input.nickname,
    rating,
    text,
    at: Date.now(),
  }

  writeReviews([review, ...readReviews()])
  notifyPlaceFeedbackChange()
  return review
}

export function hasUserReviewedPlace(
  userId: string,
  placeId: string,
): boolean {
  return getReviewsForPlace(placeId).some((r) => r.userId === userId)
}
