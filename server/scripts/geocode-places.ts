/**
 * Заполнение server/data/place-coords.json через 2GIS Geocoder.
 * Уже сохранённые id пропускаются (0 запросов). Перезаписать всё: --force
 * Usage: cd server && npm run geocode:places
 */
import { isDgisConfigured } from '../src/lib/dgis.js'
import { geocodeManifestEntry } from '../src/lib/geocode-entry.js'
import {
  hasValidPlaceCoord,
  readPlaceCoordsCache,
  writePlaceCoordsCache,
  type PlaceCoordRecord,
} from '../src/lib/place-coords-cache.js'
import { ALL_GEOCODE_MANIFEST } from '../src/data/geocode-manifest.js'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  if (!isDgisConfigured()) {
    console.error('Set DGIS_API_KEY in server/.env')
    process.exit(1)
  }

  const force = process.argv.includes('--force')
  const cache = await readPlaceCoordsCache()
  let ok = 0
  let miss = 0
  let skipped = 0

  for (const entry of ALL_GEOCODE_MANIFEST) {
    process.stdout.write(`${entry.id} … `)
    if (!force && hasValidPlaceCoord(cache, entry.id, entry.query)) {
      const hit = cache[entry.id]!
      console.log(`cached ${hit.lat.toFixed(5)}, ${hit.lng.toFixed(5)}`)
      skipped++
      continue
    }
    try {
      const coord = await geocodeManifestEntry(entry)
      if (!coord) {
        console.log('miss')
        miss++
      } else {
        const record: PlaceCoordRecord = {
          lng: coord.lng,
          lat: coord.lat,
          query: entry.query,
          geocodedAt: new Date().toISOString(),
        }
        cache[entry.id] = record
        console.log(`${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)}`)
        ok++
      }
    } catch (e) {
      console.log('error', e)
      miss++
    }
    await sleep(1100)
  }

  await writePlaceCoordsCache(cache)
  console.log(
    `\nDone: ${ok} geocoded, ${skipped} skipped (cache), ${miss} miss, ${Object.keys(cache).length} in cache`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
