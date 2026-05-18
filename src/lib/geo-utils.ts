/** Кольцо координат вокруг точки (радиус в метрах). */
export function geodesicCircleRing(
  lng: number,
  lat: number,
  radiusMeters: number,
  steps = 64,
): [number, number][] {
  const R = 6_371_000
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const d = radiusMeters / R
  const ring: [number, number][] = []

  for (let i = 0; i <= steps; i++) {
    const bearing = ((i / steps) * 360 * Math.PI) / 180
    const lat2 = Math.asin(
      Math.sin(latRad) * Math.cos(d) +
        Math.cos(latRad) * Math.sin(d) * Math.cos(bearing),
    )
    const lng2 =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
        Math.cos(d) - Math.sin(latRad) * Math.sin(lat2),
      )
    ring.push([(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI])
  }

  return ring
}
