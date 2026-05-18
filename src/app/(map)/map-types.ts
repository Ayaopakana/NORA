/** Общий тип колбэка карты без протягивания maplibre в главный чанк хаба */
export type NoraMapHandle = {
  getCenter: () => { lng: number; lat: number }
  getBearing: () => number
  resize: () => void
  on: (type: 'moveend', listener: () => void) => void
  flyTo: (options: {
    center: [number, number]
    zoom?: number
    pitch?: number
    bearing?: number
    duration?: number
  }) => void
  fitBounds: (
    bounds: [[number, number], [number, number]],
    options?: {
      padding?: number
      duration?: number
      pitch?: number
      bearing?: number
      maxZoom?: number
    },
  ) => void
  easeTo: (options: {
    center: [number, number]
    zoom?: number
    pitch?: number
    bearing?: number
    duration?: number
    padding?: { top?: number; bottom?: number; left?: number; right?: number }
  }) => void
}
