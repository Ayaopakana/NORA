import { isApiEnabled } from '@/api/config'
import { apiGetDislikedPlaceIds } from '@/api/places'

let dislikedCache: string[] = []
let dislikedUserId: string | null = null

export function getCachedDislikedPlaceIds(userId: string): string[] | null {
  if (isApiEnabled() && dislikedUserId === userId) {
    return dislikedCache
  }
  return null
}

export function setDislikedCache(userId: string, ids: string[]) {
  dislikedUserId = userId
  dislikedCache = ids
}

export function clearApiCaches() {
  dislikedUserId = null
  dislikedCache = []
}

export async function hydrateUserDataFromApi(userId: string) {
  if (!isApiEnabled()) return
  try {
    const ids = await apiGetDislikedPlaceIds()
    setDislikedCache(userId, ids)
  } catch {
    setDislikedCache(userId, [])
  }
}
