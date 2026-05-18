/** Краткая подпись над точкой на карте */
export type MapMarkerPopup = {
  title: string
  subtitle?: string
  detail?: string
}

export type MapSurfaceMarker = {
  id: string
  lng: number
  lat: number
  color?: string
  /** Номер остановки на маршруте */
  label?: string | number
  popup?: MapMarkerPopup
}

export function createMapMarkerElement(
  marker: MapSurfaceMarker,
  isDark: boolean,
): HTMLElement {
  const root = document.createElement('div')
  root.className = 'nora-map-marker'

  if (marker.popup) {
    const card = document.createElement('div')
    card.className = 'nora-map-marker-card'

    const title = document.createElement('div')
    title.className = 'nora-map-marker-card-title'
    title.textContent = marker.popup.title
    card.appendChild(title)

    if (marker.popup.subtitle) {
      const subtitle = document.createElement('div')
      subtitle.className = 'nora-map-marker-card-subtitle'
      subtitle.textContent = marker.popup.subtitle
      card.appendChild(subtitle)
    }

    if (marker.popup.detail) {
      const detail = document.createElement('div')
      detail.className = 'nora-map-marker-card-detail'
      detail.textContent = marker.popup.detail
      card.appendChild(detail)
    }

    root.appendChild(card)
  }

  const pin = document.createElement('div')
  const hasLabel = marker.label !== undefined && marker.label !== null
  pin.className = hasLabel
    ? 'nora-map-marker-pin nora-map-marker-pin--labeled'
    : 'nora-map-marker-pin'

  const color = marker.color ?? (isDark ? '#b8c4d4' : '#8e9aae')
  pin.style.background = color
  if (hasLabel) {
    pin.textContent = String(marker.label)
  }

  root.appendChild(pin)
  return root
}
