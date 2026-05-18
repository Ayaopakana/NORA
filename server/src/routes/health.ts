import type { FastifyInstance } from 'fastify'
import { isDgisConfigured } from '../lib/dgis.js'
import { readPlaceCoordsCache } from '../lib/place-coords-cache.js'
import { PLACES_GEOCODE_MANIFEST } from '../data/places-manifest.js'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    const cache = await readPlaceCoordsCache()
    return {
      ok: true,
      service: 'nora-api',
      time: new Date().toISOString(),
      map: {
        dgis: isDgisConfigured(),
        placeCoordsCached: Object.keys(cache).length,
        placeCoordsTotal: PLACES_GEOCODE_MANIFEST.length,
      },
    }
  })
}
