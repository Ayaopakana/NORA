/** Расстояние между точками на плоской проекции, м */
export function distanceMeters(
  a: { lng: number; lat: number },
  b: { lng: number; lat: number },
): number {
  const R = 111_320
  const dx = (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180) * R
  const dy = (a.lat - b.lat) * R
  return Math.hypot(dx, dy)
}

/** Азимут от `from` к `to`, градусы (0 = север). */
export function bearingDegrees(
  from: { lng: number; lat: number },
  to: { lng: number; lat: number },
): number {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180
  const lat1 = (from.lat * Math.PI) / 180
  const lat2 = (to.lat * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/** Следующая остановка маршрута (первая, до которой ещё не «дошли»). */
export function pickNavigationTarget(
  user: { lng: number; lat: number },
  stops: readonly { lng: number; lat: number }[],
  reachedThresholdM = 85,
): { lng: number; lat: number } | null {
  if (!stops.length) return null
  for (const stop of stops) {
    if (distanceMeters(user, stop) > reachedThresholdM) return stop
  }
  return stops[stops.length - 1]!
}

export const NAV_CAMERA = {
  pitch: 62,
  zoom: 17.5,
  padding: { top: 100, bottom: 200, left: 48, right: 48 },
} as const

export function resolveNavigationBearing(
  user: { lng: number; lat: number; heading?: number | null },
  target: { lng: number; lat: number },
  fallbackBearing: number,
): number {
  if (
    user.heading != null &&
    Number.isFinite(user.heading) &&
    user.heading >= 0
  ) {
    return user.heading
  }
  return bearingDegrees(user, target)
}
