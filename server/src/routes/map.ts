import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { dgisWalkingRoute, isDgisConfigured } from '../lib/dgis.js'
import { osrmWalkingRoute } from '../lib/osrm-route.js'
import { appendPathPoints } from '../lib/wkt.js'
import { geocodeManifestEntry } from '../lib/geocode-entry.js'
import {
  hasValidPlaceCoord,
  readPlaceCoordsCache,
  upsertPlaceCoord,
  writePlaceCoordsCache,
  type PlaceCoordRecord,
} from '../lib/place-coords-cache.js'
import { apiError } from '../lib/errors.js'
import { ALL_GEOCODE_MANIFEST } from '../data/geocode-manifest.js'
import { PLACES_GEOCODE_MANIFEST } from '../data/places-manifest.js'
import { POPULAR_PLACES_CATALOG } from '../data/popular-places-catalog.js'
import type { LngLat } from '../lib/wkt.js'

const routePointSchema = z.object({
  lng: z.number(),
  lat: z.number(),
})

const routeBodySchema = z.object({
  points: z.array(routePointSchema).min(2).max(12),
})

const routeCache = new Map<string, { path: LngLat[]; expires: number }>()
const ROUTE_CACHE_TTL_MS = 1000 * 60 * 60 * 12

function routeCacheKey(points: LngLat[]) {
  return `legs-v2|${points
    .map((p) => `${p.lng.toFixed(5)},${p.lat.toFixed(5)}`)
    .join('|')}`
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mapRoutes(app: FastifyInstance) {
  app.get('/map/status', async () => {
    const cache = await readPlaceCoordsCache()
    return {
      dgisConfigured: isDgisConfigured(),
      coordsCached: Object.keys(cache).length,
      coordsTotal: ALL_GEOCODE_MANIFEST.length,
      plannerPlaces: PLACES_GEOCODE_MANIFEST.length,
      popularPlaces: ALL_GEOCODE_MANIFEST.length - PLACES_GEOCODE_MANIFEST.length,
    }
  })

  /** Кэш координат мест (2GIS geocode, без повторных запросов с фронта). */
  app.get('/map/places/coords', async () => {
    return readPlaceCoordsCache()
  })

  /** Каталог популярных мест с координатами из кэша (для поиска и маршрутов). */
  app.get('/map/places/catalog', async () => {
    const cache = await readPlaceCoordsCache()
    return POPULAR_PLACES_CATALOG.flatMap((item) => {
      const coord = cache[item.id]
      if (!coord) return []
      return [
        {
          ...item,
          lng: coord.lng,
          lat: coord.lat,
        },
      ]
    })
  })

  /** Пешеходная геометрия маршрута между остановками. */
  app.post('/map/route', async (req, reply) => {
    const parsed = routeBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'INVALID_BODY',
        message: parsed.error.flatten(),
      })
    }

    const points = parsed.data.points

    const straightFallback = () => {
      const path: LngLat[] = []
      for (let i = 0; i < points.length; i++) {
        appendPathPoints(path, [points[i]!])
      }
      return path
    }

    const key = routeCacheKey(points)
    const cached = routeCache.get(key)
    if (cached && cached.expires > Date.now()) {
      return { path: cached.path, source: '2gis' as const, cached: true }
    }

    const saveAndReturn = (path: LngLat[], source: '2gis' | 'osrm') => {
      routeCache.set(key, {
        path,
        expires: Date.now() + ROUTE_CACHE_TTL_MS,
      })
      return { path, source }
    }

    if (isDgisConfigured()) {
      try {
        const path = await dgisWalkingRoute(points)
        if (path.length >= 2) {
          return saveAndReturn(path, '2gis')
        }
      } catch (err) {
        req.log.warn({ err }, '2GIS routing failed, trying OSRM')
      }
    }

    try {
      const osrm = await osrmWalkingRoute(points)
      if (osrm.length >= 2) {
        return saveAndReturn(osrm, 'osrm')
      }
    } catch (err) {
      req.log.warn({ err }, 'OSRM routing failed')
    }

    return { path: straightFallback(), source: 'straight' as const }
  })

  /**
   * Прогон геокодера по каталогу мест (dev).
   * ~1 запрос/сек — укладывается в лимиты demo 2GIS.
   */
  app.post('/map/places/refresh', async (req, reply) => {
    if (process.env.NODE_ENV === 'production') {
      return reply.status(403).send({
        code: 'FORBIDDEN',
        message: 'Refresh is disabled in production',
      })
    }

    if (!isDgisConfigured()) {
      return reply.status(503).send({
        code: 'DGIS_NOT_CONFIGURED',
        message: 'Set DGIS_API_KEY in server/.env',
      })
    }

    const force =
      (req.query as { force?: string }).force === '1' ||
      (req.query as { force?: string }).force === 'true'

    const cache = await readPlaceCoordsCache()
    const updated: string[] = []
    const skipped: string[] = []
    const failed: Array<{ id: string; query: string }> = []

    for (const entry of ALL_GEOCODE_MANIFEST) {
      if (!force && hasValidPlaceCoord(cache, entry.id, entry.query)) {
        skipped.push(entry.id)
        continue
      }
      try {
        const coord = await geocodeManifestEntry(entry)
        if (!coord) {
          failed.push({ id: entry.id, query: entry.query })
        } else {
          const record: PlaceCoordRecord = {
            lng: coord.lng,
            lat: coord.lat,
            query: entry.query,
            geocodedAt: new Date().toISOString(),
          }
          cache[entry.id] = record
          updated.push(entry.id)
        }
      } catch (err) {
        req.log.warn({ err, id: entry.id }, 'geocode failed')
        failed.push({ id: entry.id, query: entry.query })
      }
      await sleep(1100)
    }

    await writePlaceCoordsCache(cache)

    return {
      updated: updated.length,
      skipped: skipped.length,
      skippedIds: skipped,
      failed,
      coords: cache,
    }
  })

  /** Геокодировать одно место по id из manifest (dev). */
  app.post('/map/places/:id/geocode', async (req, reply) => {
    if (!isDgisConfigured()) {
      return reply.status(503).send(apiError(503, 'DGIS_NOT_CONFIGURED', 'Set DGIS_API_KEY'))
    }

    const { id } = req.params as { id: string }
    const force =
      (req.query as { force?: string }).force === '1' ||
      (req.query as { force?: string }).force === 'true'
    const entry = ALL_GEOCODE_MANIFEST.find((p) => p.id === id)
    if (!entry) {
      return reply.status(404).send(apiError(404, 'NOT_FOUND', 'Unknown place id'))
    }

    const cache = await readPlaceCoordsCache()
    if (!force && hasValidPlaceCoord(cache, id, entry.query)) {
      const hit = cache[id]!
      return { id, ...hit, cached: true as const }
    }

    const coord = await geocodeManifestEntry(entry)
    if (!coord) {
      return reply.status(404).send(apiError(404, 'GEOCODE_MISS', 'No result from 2GIS'))
    }

    const record: PlaceCoordRecord = {
      lng: coord.lng,
      lat: coord.lat,
      query: entry.query,
      geocodedAt: new Date().toISOString(),
    }
    await upsertPlaceCoord(id, record)
    return { id, ...record }
  })
}
