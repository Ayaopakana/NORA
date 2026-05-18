import type { PlaceManifestEntry } from './places-manifest.js'
import { PLACES_GEOCODE_MANIFEST } from './places-manifest.js'
import { POPULAR_PLACES_MANIFEST } from './popular-places-manifest.js'

/** Полный список для геокодирования (планер + популярные POI). */
export const ALL_GEOCODE_MANIFEST: PlaceManifestEntry[] = [
  ...PLACES_GEOCODE_MANIFEST,
  ...POPULAR_PLACES_MANIFEST,
]
