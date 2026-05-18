'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchWalkingRoutePath } from '@/api/map'
import { isApiEnabled } from '@/api/config'
import {
  fetchOsrmWalkingPath,
  isStraightLinePath,
  straightWalkingPath,
} from '@/lib/walking-route-path'
import {
  routePathFromStops,
  type MapRoutePoint,
} from '@/lib/map-route-layer'

type StopLike = { lng: number; lat: number }

function buildWaypoints(
  stops: readonly StopLike[] | undefined,
  origin: StopLike | null | undefined,
): MapRoutePoint[] | undefined {
  if (!stops?.length) return undefined
  if (origin) {
    return [
      { lng: origin.lng, lat: origin.lat },
      ...(stops as MapRoutePoint[]),
    ]
  }
  return stops.length >= 2 ? (stops as MapRoutePoint[]) : undefined
}

/**
 * Геометрия маршрута по дорогам: 2GIS (бэкенд) → OSRM → отрезки между остановками.
 * С `origin` путь строится: вы → первая остановка → … → конец.
 */
export function useMapRoutePath(
  stops: readonly StopLike[] | undefined,
  origin?: StopLike | null,
): MapRoutePoint[] | undefined {
  const waypoints = useMemo(
    () => buildWaypoints(stops, origin),
    [stops, origin?.lng, origin?.lat],
  )

  const straight = useMemo(
    () =>
      waypoints?.length
        ? straightWalkingPath(waypoints)
        : undefined,
    [waypoints],
  )

  const [path, setPath] = useState<MapRoutePoint[] | undefined>(straight)
  const stopsKey = useMemo(
    () =>
      waypoints
        ?.map((s) => `${s.lng.toFixed(5)},${s.lat.toFixed(5)}`)
        .join('|') ?? '',
    [waypoints],
  )

  useEffect(() => {
    setPath(straight)
    if (!waypoints || waypoints.length < 2) return

    let cancelled = false

    const applyPath = (next: MapRoutePoint[] | undefined) => {
      if (cancelled || !next || next.length < 2) return
      setPath(next)
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        const stopPoints = waypoints

        if (isApiEnabled()) {
          const res = await fetchWalkingRoutePath(stopPoints)
          if (cancelled) return

          if (res?.path && res.path.length >= 2) {
            if (
              res.source === 'straight' ||
              isStraightLinePath(res.path, stopPoints)
            ) {
              const osrm = await fetchOsrmWalkingPath(stopPoints)
              if (osrm && osrm.length >= 2) {
                applyPath(osrm)
                return
              }
              applyPath(straightWalkingPath(stopPoints))
              return
            }
            applyPath(res.path)
            return
          }
        }

        const osrm = await fetchOsrmWalkingPath(stopPoints)
        if (osrm && osrm.length >= 2) {
          applyPath(osrm)
          return
        }

        applyPath(straightWalkingPath(stopPoints))
      })()
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [stopsKey, straight, waypoints])

  return path
}
