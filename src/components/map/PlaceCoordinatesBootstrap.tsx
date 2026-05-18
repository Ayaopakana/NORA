'use client'

import { useEffect } from 'react'
import { loadPlaceCoordinates } from '@/lib/place-coordinates'
import { loadVenueCatalog } from '@/lib/venue-catalog'

/** Подгружает координаты и каталог мест с API при входе в карту. */
export function PlaceCoordinatesBootstrap() {
  useEffect(() => {
    void Promise.all([loadPlaceCoordinates(), loadVenueCatalog()])
  }, [])
  return null
}
