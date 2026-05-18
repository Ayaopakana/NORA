import { dgisGeocode } from './dgis.js'
import type { LngLat } from './wkt.js'
import type { PlaceManifestEntry } from '../data/places-manifest.js'

/** Типичная «центровая» точка при неудачном геокоде — отбрасываем для адресных запросов. */
const BISHKEK_CENTER_FALLBACK = { lng: 74.553811, lat: 42.873155 }

function isCenterFallback(coord: LngLat, query: string): boolean {
  const dLng = Math.abs(coord.lng - BISHKEK_CENTER_FALLBACK.lng)
  const dLat = Math.abs(coord.lat - BISHKEK_CENTER_FALLBACK.lat)
  if (dLng > 0.00025 || dLat > 0.00025) return false
  const stripped = query
    .replace(/^Бишкек,\s*/i, '')
    .replace(/^Кыргызстан,\s*/i, '')
    .trim()
  return stripped.length > 2 && stripped.toLowerCase() !== 'бишкек'
}

async function geocodeQuery(query: string): Promise<LngLat | null> {
  const coord = await dgisGeocode(query)
  if (!coord) return null
  if (isCenterFallback(coord, query)) return null
  return coord
}

/** Геокодирование записи manifest с запасным запросом. */
export async function geocodeManifestEntry(
  entry: PlaceManifestEntry,
): Promise<LngLat | null> {
  const primary = await geocodeQuery(entry.query)
  if (primary) return primary
  if (entry.fallbackQuery) {
    return geocodeQuery(entry.fallbackQuery)
  }
  return null
}
