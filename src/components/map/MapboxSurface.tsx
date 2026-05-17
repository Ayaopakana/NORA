'use client'

import maplibregl from 'maplibre-gl'
import type {
  MapMouseEvent,
  Map as MapLibreMap,
  Marker,
  StyleSpecification,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { applyNoraVectorMapStyle } from '@/lib/map-nora-vector-style'
import { mapAppearanceScheme } from '@/lib/map-appearance'
import {
  mapFallbackForTheme,
  mapStyleForTheme,
} from '@/lib/map-styles'
import { useI18n } from '@/hooks/useI18n'
import { translateKey } from '@/i18n/locale-storage'
import { syncMapRouteLayer, type MapRoutePoint } from '@/lib/map-route-layer'
import { cn } from '@/lib/utils'

/** Центр карты по умолчанию — Бишкек */
const DEFAULT_CENTER: [number, number] = [74.5698, 42.8746]

export type MapboxSurfaceProps = {
  className?: string
  /** @deprecated тонировка задаётся классом nora-map-dark / nora-map-light */
  blueMono?: boolean
  onMap?: (map: MapLibreMap) => void
  pickPoint?: (coords: { lng: number; lat: number }) => void
  markers?: {
    id: string
    lng: number
    lat: number
    color?: string
    /** Номер остановки на маршруте */
    label?: string | number
  }[]
  /** Точки маршрута по порядку — линия на карте (демо, до бэкенд-роутинга) */
  routePath?: MapRoutePoint[]
}

type MapViewState = {
  center: [number, number]
  zoom: number
  bearing: number
  pitch: number
}

export function MapboxSurface({
  className,
  onMap,
  pickPoint,
  markers,
  routePath,
}: MapboxSurfaceProps) {
  const { t } = useI18n()
  const { theme, resolvedTheme } = useTheme()
  const mapScheme = mapAppearanceScheme(theme, resolvedTheme)
  const isDark = mapScheme === 'dark'

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerObjs = useRef<Marker[]>([])
  const onMapRef = useRef(onMap)
  onMapRef.current = onMap
  const pickPointRef = useRef(pickPoint)
  pickPointRef.current = pickPoint
  const themeRef = useRef(theme)
  themeRef.current = theme
  const resolvedThemeRef = useRef(resolvedTheme)
  resolvedThemeRef.current = resolvedTheme

  const getMapScheme = () =>
    mapAppearanceScheme(themeRef.current, resolvedThemeRef.current)

  const [tileError, setTileError] = useState<string | null>(null)
  const [isRasterFallback, setIsRasterFallback] = useState(false)
  const [mounted, setMounted] = useState(false)
  /** Пока false — закрываем «сырую» серую подложку, пока стиль и тайлы не готовы. */
  const [mapTilesReady, setMapTilesReady] = useState(false)

  const isRasterFallbackRef = useRef(false)
  isRasterFallbackRef.current = isRasterFallback
  const tilesReadyListenerRef = useRef<(() => void) | null>(null)
  /** Чтобы не вызывать setStyle сразу после перехода на растр с тем же стилем. */
  const rasterThemeSyncedRef = useRef<string | undefined>(undefined)
  /** Последняя тема векторного стиля (Positron vs Dark) — без полного setStyle слои двух стилей смешиваются. */
  const vectorSchemeSyncedRef = useRef<'light' | 'dark' | undefined>(undefined)
  const vectorStyleSwitchGenRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  /** Один раз при монтировании: смена темы не пересоздаёт MapLibre (позиция не сбрасывается). */
  useEffect(() => {
    const el = containerRef.current
    if (!el || !mounted) return

    setTileError(null)
    setIsRasterFallback(false)
    setMapTilesReady(false)
    rasterThemeSyncedRef.current = undefined
    vectorSchemeSyncedRef.current = undefined

    let cancelled = false
    let instance: MapLibreMap | null = null
    let ro: ResizeObserver | null = null
    let onClick: ((e: MapMouseEvent) => void) | undefined
    let usedFallback = false

    const initialScheme = getMapScheme()
    const vectorStyle = mapStyleForTheme(
      initialScheme === 'light' ? 'light' : undefined,
    )

    const attachPick = (map: MapLibreMap) => {
      if (onClick) map.off('click', onClick)
      const pick = pickPointRef.current
      if (!pick) {
        map.getCanvas().style.cursor = ''
        return
      }
      onClick = (e) => pick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      map.on('click', onClick)
      map.getCanvas().style.cursor = 'crosshair'
    }

    const readView = (map: MapLibreMap): MapViewState => ({
      center: [map.getCenter().lng, map.getCenter().lat],
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    })

    const afterLoad = (map: MapLibreMap, runGeolocate: boolean) => {
      map.resize()
      map.setMaxPitch(85)
      try {
        applyNoraVectorMapStyle(map, getMapScheme() === 'dark')
      } catch {
        /* векторный стиль мог ещё догружаться */
      }
      map.once('idle', () => {
        try {
          applyNoraVectorMapStyle(map, getMapScheme() === 'dark')
        } catch {
          /* */
        }
      })
      onMapRef.current?.(map)
      attachPick(map)

      if (runGeolocate && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return
            map.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: 13,
              pitch: 58,
              bearing: -22,
              duration: 2200,
            })
          },
          () => {},
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 },
        )
      }
    }

    let styleLoadCompleted = false

    const wireErrors = (map: MapLibreMap) => {
      map.on('error', (e) => {
        if (cancelled) return
        const msg =
          e.error?.message ??
          (typeof e.error === 'string' ? e.error : translateKey('mapSurface.tileError'))
        setTileError(msg)
      })
    }

    const createMap = (
      style: string | StyleSpecification,
      view?: MapViewState,
      runGeolocate = true,
    ) => {
      if (cancelled || !containerRef.current) return

      setMapTilesReady(false)
      styleLoadCompleted = false

      instance = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: view?.center ?? DEFAULT_CENTER,
        zoom: view?.zoom ?? 12,
        bearing: view?.bearing ?? -18,
        pitch: view?.pitch ?? 56,
        attributionControl: false,
        /* Быстрее показывать тайлы, без долгого «растворения» пустой подложки */
        fadeDuration: 0,
        maxPitch: 85,
      })

      mapRef.current = instance

      const onTilesIdle = () => {
        if (cancelled || !instance || !styleLoadCompleted) return
        try {
          instance.off('idle', onTilesIdle)
        } catch {
          /* */
        }
        tilesReadyListenerRef.current = null
        setMapTilesReady(true)
      }
      tilesReadyListenerRef.current = onTilesIdle
      instance.on('idle', onTilesIdle)

      instance.addControl(
        new maplibregl.NavigationControl({ visualizePitch: true }),
        'bottom-right',
      )

      wireErrors(instance)

      instance.once('load', () => {
        if (cancelled || !instance) return
        styleLoadCompleted = true
        afterLoad(instance, runGeolocate)
      })

      ro?.disconnect()
      ro = new ResizeObserver(() => {
        instance?.resize()
      })
      ro.observe(containerRef.current)
    }

    createMap(vectorStyle)

    const fallbackTimer = window.setTimeout(() => {
      if (cancelled || !instance || usedFallback) return
      if (instance.isStyleLoaded() && instance.loaded()) return

      if (tilesReadyListenerRef.current && instance) {
        try {
          instance.off('idle', tilesReadyListenerRef.current)
        } catch {
          /* */
        }
        tilesReadyListenerRef.current = null
      }

      usedFallback = true
      setIsRasterFallback(true)
      rasterThemeSyncedRef.current = getMapScheme()
      const preserved = readView(instance)
      instance.remove()
      instance = null
      mapRef.current = null
      markerObjs.current.forEach((m) => m.remove())
      markerObjs.current = []

      const rasterFallback = mapFallbackForTheme(getMapScheme())
      createMap(rasterFallback, preserved, false)
    }, 8000)

    const tilesFallbackTimer = window.setTimeout(() => {
      if (cancelled) return
      setMapTilesReady(true)
    }, 25_000)

    return () => {
      cancelled = true
      window.clearTimeout(fallbackTimer)
      window.clearTimeout(tilesFallbackTimer)
      ro?.disconnect()
      if (onClick && instance) instance.off('click', onClick)
      if (tilesReadyListenerRef.current && instance) {
        try {
          instance.off('idle', tilesReadyListenerRef.current)
        } catch {
          /* */
        }
        tilesReadyListenerRef.current = null
      }
      markerObjs.current.forEach((m) => m.remove())
      markerObjs.current = []
      instance?.remove()
      instance = null
      mapRef.current = null
    }
  }, [mounted])

  /** Вектор: полный обмен URL стиля — иначе смешиваются слои Positron и Dark. Без оверлея «загрузки». */
  useEffect(() => {
    if (!mounted) return
    const map = mapRef.current
    if (!map || isRasterFallback) return

    if (vectorSchemeSyncedRef.current === undefined) {
      vectorSchemeSyncedRef.current = mapScheme
      return
    }
    if (vectorSchemeSyncedRef.current === mapScheme) return
    vectorSchemeSyncedRef.current = mapScheme

    const gen = ++vectorStyleSwitchGenRef.current
    const nextUrl = mapStyleForTheme(mapScheme === 'light' ? 'light' : undefined)
    const center = map.getCenter()
    const zoom = map.getZoom()
    const bearing = map.getBearing()
    const pitch = map.getPitch()
    const applyDark = mapScheme === 'dark'

    const finishVectorTheme = () => {
      if (gen !== vectorStyleSwitchGenRef.current) return
      if (!map.isStyleLoaded()) return
      map.jumpTo({ center, zoom, bearing, pitch })
      map.resize()
      try {
        applyNoraVectorMapStyle(map, applyDark)
      } catch {
        /* */
      }
    }

    /* После setStyle приходит серия styledata; первый раз список слоёв может быть ещё без building —
     * одна отписка и один apply тогда навсегда пропускают ensureBuildings3d. Держим слушатель до idle. */
    const onStyleData = () => {
      if (gen !== vectorStyleSwitchGenRef.current) return
      if (!map.isStyleLoaded()) return
      try {
        applyNoraVectorMapStyle(map, applyDark)
      } catch {
        /* */
      }
    }

    map.on('styledata', onStyleData)
    map.setStyle(nextUrl)
    map.once('idle', () => {
      map.off('styledata', onStyleData)
      finishVectorTheme()
    })

    return () => {
      map.off('styledata', onStyleData)
    }
  }, [mapScheme, isRasterFallback, mounted])

  /** Растровый fallback: разные стили — setStyle с сохранением камеры (только при смене темы). */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isRasterFallbackRef.current) return

    if (rasterThemeSyncedRef.current === undefined) {
      rasterThemeSyncedRef.current = mapScheme
      return
    }
    if (rasterThemeSyncedRef.current === mapScheme) return
    rasterThemeSyncedRef.current = mapScheme

    const center = map.getCenter()
    const zoom = map.getZoom()
    const bearing = map.getBearing()
    const pitch = map.getPitch()
    const nextStyle = mapFallbackForTheme(mapScheme)

    const onRasterStyleData = () => {
      if (!map.isStyleLoaded()) return
      map.off('styledata', onRasterStyleData)
      map.jumpTo({
        center,
        zoom,
        bearing,
        pitch,
      })
      map.resize()
    }

    map.on('styledata', onRasterStyleData)
    map.setStyle(nextStyle)

    return () => {
      map.off('styledata', onRasterStyleData)
    }
  }, [mapScheme])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const pick = pickPointRef.current
    const onClickHandler = pick
      ? (e: MapMouseEvent) => pick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      : undefined

    if (onClickHandler) {
      map.on('click', onClickHandler)
      map.getCanvas().style.cursor = 'crosshair'
    } else {
      map.getCanvas().style.cursor = ''
    }

    return () => {
      if (onClickHandler) map.off('click', onClickHandler)
    }
  }, [pickPoint])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const syncOverlays = () => {
      markerObjs.current.forEach((m) => m.remove())
      markerObjs.current = []

      if (markers) {
        for (const m of markers) {
          const el = document.createElement('div')
          const hasLabel = m.label !== undefined && m.label !== null
          const size = hasLabel ? 24 : 14
          el.style.width = `${size}px`
          el.style.height = `${size}px`
          el.style.borderRadius = '999px'
          el.style.background = m.color ?? '#38bdf8'
          el.style.boxShadow =
            '0 1px 3px rgba(15,23,42,0.35), 0 0 14px rgba(56,189,248,0.55), 0 0 2px rgba(14,165,233,0.9)'
          el.style.border = '2px solid rgba(241,245,249,0.92)'
          if (hasLabel) {
            el.style.display = 'flex'
            el.style.alignItems = 'center'
            el.style.justifyContent = 'center'
            el.style.fontSize = '11px'
            el.style.fontWeight = '700'
            el.style.color = '#0f172a'
            el.textContent = String(m.label)
          }
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([m.lng, m.lat])
            .addTo(map)
          markerObjs.current.push(marker)
        }
      }

      syncMapRouteLayer(map, routePath)
    }

    if (map.isStyleLoaded()) {
      syncOverlays()
    } else {
      map.once('load', syncOverlays)
    }

    const onStyleData = () => {
      if (!map.isStyleLoaded()) return
      syncOverlays()
    }
    map.on('styledata', onStyleData)

    return () => {
      map.off('styledata', onStyleData)
    }
  }, [markers, routePath])

  return (
    <div
      className={cn(
        'relative h-full min-h-0 w-full overflow-hidden',
        isDark && 'nora-map-dark',
        isRasterFallback && 'nora-map-raster',
        !isDark && 'nora-map-light',
        className,
      )}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {!mapTilesReady ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-center gap-2 transition-opacity duration-300',
            isDark
              ? 'bg-[#020617] text-slate-400'
              : 'bg-[#edf2f6] text-slate-500',
          )}
          aria-busy
          aria-label={t('mapSurface.loadingAria')}
        >
          <span
            className={cn(
              'text-sm font-medium',
              isDark ? 'text-sky-400/90' : 'text-sky-700/90',
            )}
          >
            NORA
          </span>
          <p className="text-xs">{t('map.loading')}</p>
          <span
            className={cn(
              'mt-2 block h-1 w-28 rounded-full motion-safe:animate-pulse',
              isDark ? 'bg-sky-500/35' : 'bg-sky-600/30',
            )}
          />
        </div>
      ) : null}
      {tileError ? (
        <div className="pointer-events-none absolute bottom-24 left-3 right-3 z-[5] rounded-xl border border-amber-500/40 bg-amber-950/90 px-3 py-2 text-center text-xs text-amber-100">
          Не удалось подгрузить часть карты: {tileError}. Проверьте интернет или
          отключите блокировщик рекламы для localhost.
        </div>
      ) : null}
    </div>
  )
}
