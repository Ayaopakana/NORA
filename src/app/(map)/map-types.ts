/** Общий тип колбэка карты без протягивания maplibre в главный чанк хаба */
export type NoraMapHandle = {
  getCenter: () => { lng: number; lat: number }
  getBearing: () => number
  on: (type: 'moveend', listener: () => void) => void
  flyTo: (options: {
    center: [number, number]
    zoom?: number
    pitch?: number
    bearing?: number
    duration?: number
  }) => void
}
