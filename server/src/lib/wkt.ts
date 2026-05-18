export type LngLat = { lng: number; lat: number }

/** Парсит LINESTRING(lon lat, lon lat, …) из ответа 2GIS Routing. */
export function parseLineStringWkt(wkt: string): LngLat[] {
  const trimmed = wkt.trim()
  const match = /^LINESTRING\s*\((.+)\)\s*$/i.exec(trimmed)
  if (!match) return []

  return match[1]
    .split(',')
    .map((pair) => {
      const parts = pair.trim().split(/\s+/)
      if (parts.length < 2) return null
      const lng = Number(parts[0])
      const lat = Number(parts[1])
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
      return { lng, lat }
    })
    .filter((p): p is LngLat => p !== null)
}

function samePoint(a: LngLat, b: LngLat, eps = 1e-6) {
  return Math.abs(a.lng - b.lng) < eps && Math.abs(a.lat - b.lat) < eps
}

/** Склеить участки без дублирования узлов на стыках. */
export function appendPathPoints(target: LngLat[], chunk: LngLat[]) {
  for (const p of chunk) {
    const prev = target[target.length - 1]
    if (prev && samePoint(prev, p)) continue
    target.push(p)
  }
}

function pushGeometryNode(out: LngLat[], node: unknown) {
  if (node === null || node === undefined) return

  if (typeof node === 'string') {
    if (node.toUpperCase().startsWith('LINESTRING')) {
      appendPathPoints(out, parseLineStringWkt(node))
    }
    return
  }

  if (Array.isArray(node)) {
    for (const item of node) pushGeometryNode(out, item)
    return
  }

  if (typeof node !== 'object') return

  const record = node as Record<string, unknown>
  if (typeof record.selection === 'string') {
    appendPathPoints(out, parseLineStringWkt(record.selection))
    return
  }

  if (record.geometry !== undefined) {
    pushGeometryNode(out, record.geometry)
  }
}

/**
 * Упорядоченная геометрия одного варианта маршрута 2GIS:
 * begin_pedestrian → maneuvers[].outcoming_path → end_pedestrian.
 */
export function extractOrderedRouteGeometry(route: unknown): LngLat[] {
  if (!route || typeof route !== 'object') return []
  const r = route as Record<string, unknown>
  const out: LngLat[] = []

  if (r.begin_pedestrian_path) {
    pushGeometryNode(out, r.begin_pedestrian_path)
  }

  const maneuvers = r.maneuvers
  if (Array.isArray(maneuvers)) {
    for (const maneuver of maneuvers) {
      if (!maneuver || typeof maneuver !== 'object') continue
      const m = maneuver as Record<string, unknown>
      if (m.outcoming_path) {
        pushGeometryNode(out, m.outcoming_path)
      }
    }
  }

  if (r.end_pedestrian_path) {
    pushGeometryNode(out, r.end_pedestrian_path)
  }

  return out
}

/** @deprecated Используйте extractOrderedRouteGeometry — старый merge собирал LINESTRING вразнобой. */
export function mergeLineStrings(lineStrings: string[]): LngLat[] {
  const out: LngLat[] = []
  for (const wkt of lineStrings) {
    appendPathPoints(out, parseLineStringWkt(wkt))
  }
  return out
}
