import type { Map as MapLibreMap } from 'maplibre-gl'

/** Пересчёт размера canvas после оверлеев, клавиатуры и смены данных на карте. */
export function nudgeMapResize(map: MapLibreMap | null | undefined) {
  if (!map) return
  try {
    map.resize()
    requestAnimationFrame(() => {
      try {
        map.resize()
        map.triggerRepaint()
      } catch {
        /* карта могла размонтироваться */
      }
    })
  } catch {
    /* */
  }
}
