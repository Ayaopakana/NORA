/**
 * Ручные правки координат (проверены по 2GIS до исчерпания квоты).
 * Usage: npx tsx scripts/apply-coord-corrections.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_GEOCODE_MANIFEST } from '../src/data/geocode-manifest.js'
import type { PlaceCoordsFile } from '../src/lib/place-coords-cache.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = path.join(__dirname, '../data/place-coords.json')

/** lng, lat — проверенные точки */
const CORRECTIONS: Record<string, { lng: number; lat: number }> = {
  'calm-2': { lng: 74.607609, lat: 42.877162 },
  'calm-4': { lng: 74.603667, lat: 42.875426 },
  'energy-2': { lng: 74.603667, lat: 42.875426 },
  'energy-3': { lng: 74.60316, lat: 42.82432 },
  'tired-2': { lng: 74.60657, lat: 42.86905 },
  'anxious-1': { lng: 74.59928, lat: 42.87996 },
  'anxious-3': { lng: 74.59047, lat: 42.85899 },
  'event-calm-1': { lng: 74.52376, lat: 42.63765 },
  'event-energy-1': { lng: 74.59624, lat: 42.80645 },
  'poi-park-panfilov': { lng: 74.59928, lat: 42.87996 },
  'poi-park-pobedy': { lng: 74.60316, lat: 42.82432 },
  'poi-park-dubovy': { lng: 74.60761, lat: 42.87716 },
  'poi-park-ata-turk': { lng: 74.59575, lat: 42.83953 },
  'poi-park-botanic': { lng: 74.59047, lat: 42.85899 },
  'poi-park-molodezhny': { lng: 74.57487, lat: 42.88583 },
  'poi-park-ak-keme': { lng: 74.5825, lat: 42.83875 },
  'poi-bulvar-erkendik': { lng: 74.60657, lat: 42.86905 },
  'poi-skver-toktogul': { lng: 74.57461, lat: 42.87374 },
  'poi-ploshchad-ala-too': { lng: 74.603667, lat: 42.875426 },
  'poi-park-yuzhny': { lng: 74.63346, lat: 42.87223 },
  'poi-zoo': { lng: 74.55124, lat: 42.81456 },
  'poi-hotel-hyatt': { lng: 74.60209, lat: 42.87256 },
  'poi-hotel-orion': { lng: 74.58617, lat: 42.889 },
  'poi-hotel-ambassador': { lng: 74.64229, lat: 42.90489 },
  'poi-hotel-ak-keme': { lng: 74.5825, lat: 42.83875 },
  'poi-cafe-casa': { lng: 74.56127, lat: 42.81891 },
  'poi-rest-navigator': { lng: 74.58847, lat: 42.87488 },
  'poi-rest-navat': { lng: 74.61328, lat: 42.87526 },
  'poi-rest-old-bukhara': { lng: 74.61752, lat: 42.87793 },
  'poi-rest-ethno-complex': { lng: 74.61808, lat: 42.85467 },
  'poi-cafe-gap': { lng: 74.58721, lat: 42.87628 },
  'poi-cafe-teplo': { lng: 74.6069, lat: 42.84325 },
  'poi-bar-save-the-ales': { lng: 74.58323, lat: 42.87103 },
  'poi-bar-ipub': { lng: 74.57652, lat: 42.87587 },
  'poi-bar-metro-pub': { lng: 74.60019, lat: 42.8682 },
  'poi-bar-pinta': { lng: 74.59422, lat: 42.8793 },
  'poi-bar-garage': { lng: 74.6006, lat: 42.87507 },
  'poi-bar-klub-kvartira': { lng: 74.57652, lat: 42.87587 },
  'poi-bar-promzona': { lng: 74.61194, lat: 42.90383 },
  'poi-mall-bishkek-park': { lng: 74.59017, lat: 42.87461 },
  'poi-mall-asia-mall': { lng: 74.585, lat: 42.85558 },
  'poi-mall-tsum': { lng: 74.61453, lat: 42.87662 },
  'poi-mall-dordoi-plaza': { lng: 74.61802, lat: 42.87421 },
  'poi-mall-globus': { lng: 74.59017, lat: 42.87461 },
  'poi-mall-vesna': { lng: 74.5769, lat: 42.87379 },
  'poi-market-dordoi': { lng: 74.62151, lat: 42.93837 },
  'poi-market-ortosai': { lng: 74.59624, lat: 42.80645 },
  'poi-culture-philharmonic': { lng: 74.58752, lat: 42.8781 },
  'poi-culture-opera': { lng: 74.6125, lat: 42.87804 },
  'poi-culture-history-museum': { lng: 74.60363, lat: 42.87774 },
  'poi-culture-art-museum': { lng: 74.61074, lat: 42.87881 },
  'poi-culture-russian-theatre': { lng: 74.6027, lat: 42.87896 },
  'poi-culture-manas': { lng: 74.6366, lat: 42.8552 },
  'poi-fun-aquapark': { lng: 74.5825, lat: 42.83875 },
  'poi-fun-ice-palace': { lng: 74.62651, lat: 42.8883 },
  'poi-fun-spartak-stadium': { lng: 74.59797, lat: 42.88005 },
  'poi-fun-dordoi-ethno': { lng: 74.52376, lat: 42.63765 },
}

const CENTER = { lng: 74.553811, lat: 42.873155 }
const BAD708 = { lng: 74.708939, lat: 42.809652 }

function isBad(coord: { lng: number; lat: number }) {
  if (
    Math.abs(coord.lng - CENTER.lng) < 0.0003 &&
    Math.abs(coord.lat - CENTER.lat) < 0.0003
  ) {
    return true
  }
  if (Math.abs(coord.lng - BAD708.lng) < 0.0003) return true
  return false
}

const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8')) as PlaceCoordsFile
const manifestById = new Map(ALL_GEOCODE_MANIFEST.map((e) => [e.id, e]))
let fixed = 0

for (const [id, patch] of Object.entries(CORRECTIONS)) {
  const entry = manifestById.get(id)
  const prev = cache[id]
  cache[id] = {
    lng: patch.lng,
    lat: patch.lat,
    query: entry?.query ?? prev?.query ?? id,
    geocodedAt: new Date().toISOString(),
  }
  fixed++
}

for (const [id, rec] of Object.entries(cache)) {
  if (isBad(rec) && !CORRECTIONS[id]) {
    console.warn('Still bad (no correction):', id, rec.query)
  }
}

writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')
console.log(`Applied ${fixed} corrections to ${CACHE_PATH}`)
