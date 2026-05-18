import { haversineKm } from '@/lib/route-area-bounds'

export type RouteStopLike = { lng: number; lat: number }

function pathLengthOpen<T extends RouteStopLike>(
  route: T[],
  start: { lng: number; lat: number },
): number {
  if (!route.length) return 0
  let d = haversineKm(start, route[0]!)
  for (let i = 0; i < route.length - 1; i++) {
    d += haversineKm(route[i]!, route[i + 1]!)
  }
  return d
}

function nearestNeighborOrder<T extends RouteStopLike>(
  stops: T[],
  start: { lng: number; lat: number },
): T[] {
  const rem = [...stops]
  const ordered: T[] = []
  let current = start

  while (rem.length) {
    rem.sort((a, b) => haversineKm(a, current) - haversineKm(b, current))
    const next = rem.shift()!
    ordered.push(next)
    current = next
  }

  return ordered
}

/** 2-opt для открытого пешеходного маршрута (фиксированный старт района). */
function twoOptOpen<T extends RouteStopLike>(
  route: T[],
  start: { lng: number; lat: number },
): T[] {
  if (route.length < 4) return route

  let best = [...route]
  let bestLen = pathLengthOpen(best, start)
  let improved = true

  while (improved) {
    improved = false
    for (let i = 0; i < best.length - 2; i++) {
      for (let j = i + 2; j < best.length; j++) {
        const candidate = [
          ...best.slice(0, i + 1),
          ...best.slice(i + 1, j + 1).reverse(),
          ...best.slice(j + 1),
        ]
        const len = pathLengthOpen(candidate, start)
        if (len + 0.001 < bestLen) {
          best = candidate
          bestLen = len
          improved = true
        }
      }
    }
  }

  return best
}

/**
 * Упорядочить остановки для минимального пешего хода (без лишних крюков).
 */
export function optimizeWalkingOrder<T extends RouteStopLike>(
  stops: T[],
  start: { lng: number; lat: number },
): T[] {
  if (stops.length <= 1) return stops

  const nn = nearestNeighborOrder(stops, start)
  const optimized = twoOptOpen(nn, start)

  const reversed = [...optimized].reverse()
  if (
    pathLengthOpen(reversed, start) + 0.05 <
    pathLengthOpen(optimized, start)
  ) {
    return reversed
  }

  return optimized
}

/** Суммарная длина пешего пути по остановкам (км). */
export function estimateWalkingDistanceKm<T extends RouteStopLike>(
  stops: T[],
  start: { lng: number; lat: number },
): number {
  return pathLengthOpen(stops, start)
}
