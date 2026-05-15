/** Общий тип колбэка карты без протягивания maplibre в главный чанк хаба */
export type NoraMapHandle = {
  getCenter: () => { lng: number; lat: number }
  on: (type: 'moveend', listener: () => void) => void
}
