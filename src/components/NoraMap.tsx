import { load } from '@2gis/mapgl'
import { useEffect, useRef, useState } from 'react'
import './NoraMap.css'

/** Стартовый центр до геолокации (Москва) — [долгота, широта] для MapGL */
const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558]

/** Совпадает с --bg в index.css */
const MAP_BG_DARK = '#0f0e16'
const MAP_VISUAL = {
  defaultBackgroundColor: MAP_BG_DARK,
  graphicsPreset: 'immersive' as const,
}

function looksLikeTileKeyRejected(ev: unknown): boolean {
  if (!ev || typeof ev !== 'object') return false
  const e = ev as {
    type?: string
    responseStatus?: number
    responseMessage?: string
  }
  if (e.type === 'invalidtilekey') return true
  if (e.type === 'rasterTileLoadError') {
    if (e.responseStatus === 401 || e.responseStatus === 403) return true
    const msg = (e.responseMessage ?? '').toLowerCase()
    if (msg.includes('invalid') && msg.includes('key')) return true
  }
  return false
}

export function NoraMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapApiRef = useRef<{ destroy: () => void } | null>(null)
  const markerApiRef = useRef<{ destroy: () => void } | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const apiKey = import.meta.env.VITE_2GIS_API_KEY as string | undefined
  const styleFromEnv = import.meta.env.VITE_2GIS_MAP_STYLE?.trim()
  const noNightInvert = import.meta.env.VITE_2GIS_MAP_NO_INVERT === 'true'
  /** Нативный ночной стиль только через style ID; иначе — инверсия дневного тайла (см. NoraMap.css). */
  const useNightInvertFallback = Boolean(
    apiKey?.trim() && !styleFromEnv && !noNightInvert,
  )
  const [bootstrapError, setBootstrapError] = useState(false)
  const [tileKeyRejected, setTileKeyRejected] = useState(false)

  useEffect(() => {
    setBootstrapError(false)
    setTileKeyRejected(false)
  }, [apiKey])

  useEffect(() => {
    if (!apiKey?.trim() || tileKeyRejected) return

    const container = containerRef.current
    if (!container) return

    let cancelled = false

    load()
      .then((mapgl) => {
        if (cancelled || !containerRef.current) return

        const lang =
          import.meta.env.VITE_2GIS_MAP_LANG?.trim() || 'ru'
        const map = new mapgl.Map(containerRef.current, {
          key: apiKey.trim(),
          center: [...DEFAULT_CENTER],
          zoom: 13,
          zoomControl: true,
          lang,
          defaultBackgroundColor: MAP_VISUAL.defaultBackgroundColor,
          graphicsPreset: MAP_VISUAL.graphicsPreset,
          controlsLayoutPadding: { top: 12, right: 14, bottom: 16, left: 14 },
          ...(styleFromEnv ? { style: styleFromEnv } : {}),
        })
        mapApiRef.current = map

        const onMapError = (ev: unknown) => {
          if (!looksLikeTileKeyRejected(ev)) return
          setTileKeyRejected(true)
        }
        map.on('error', onMapError)

        const marker = new mapgl.Marker(map, {
          coordinates: [...DEFAULT_CENTER],
        })
        markerApiRef.current = marker

        const ro = new ResizeObserver(() => {
          map.triggerRerender()
        })
        ro.observe(containerRef.current)
        resizeObserverRef.current = ro

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords: [number, number] = [
                pos.coords.longitude,
                pos.coords.latitude,
              ]
              map.setCenter(coords)
              map.setZoom(14)
              marker.setCoordinates(coords)
            },
            () => {
              /* центр по умолчанию */
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 },
          )
        }
      })
      .catch(() => {
        if (!cancelled) setBootstrapError(true)
      })

    return () => {
      cancelled = true
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      markerApiRef.current?.destroy()
      markerApiRef.current = null
      mapApiRef.current?.destroy()
      mapApiRef.current = null
    }
  }, [apiKey, tileKeyRejected, styleFromEnv])

  if (!apiKey?.trim()) {
    return (
      <div className="nora-map-shell nora-map-fallback">
        <p className="nora-map-fallback-title">Карта 2ГИС</p>
        <p className="nora-map-fallback-text">
          Укажите ключ API в файле <code>.env</code>:
        </p>
        <code className="nora-map-fallback-code">
          VITE_2GIS_API_KEY=ваш_ключ
        </code>
        <p className="nora-map-fallback-hint">
          Демо-ключ можно получить в{' '}
          <a
            href="https://platform.2gis.ru/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Platform Manager 2ГИС
          </a>
          .
        </p>
      </div>
    )
  }

  if (bootstrapError) {
    return (
      <div className="nora-map-shell nora-map-fallback">
        <p className="nora-map-fallback-title">Не удалось загрузить карту</p>
        <p className="nora-map-fallback-text">
          Скрипт MapGL не загрузился (сеть, блокировка CDN или временная ошибка).
          Обновите страницу или проверьте доступ к{' '}
          <code className="nora-map-fallback-code">mapgl.2gis.com</code>.
        </p>
      </div>
    )
  }

  if (tileKeyRejected) {
    return (
      <div className="nora-map-shell nora-map-fallback">
        <p className="nora-map-fallback-title">Ключ API отклонён (key is invalid)</p>
        <p className="nora-map-fallback-text">
          Сервер 2ГИС не принимает этот ключ для векторных тайлов (MapGL / Map Tiles).
          Проверьте в{' '}
          <a
            href="https://platform.2gis.ru/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Platform Manager
          </a>
          :
        </p>
        <ul className="nora-map-fallback-list">
          <li>
            Создан ключ для доступа к сервису карт (демо или подписка на Map Tiles), а
            не только к другому API.
          </li>
          <li>Срок демо-доступа не истёк.</li>
          <li>
            В ограничениях по доменам/referrer указаны ваш хост (например{' '}
            <code>http://localhost:5173</code> для Vite).
          </li>
          <li>
            После правки <code>.env</code> полностью перезапустите{' '}
            <code>npm run dev</code>.
          </li>
        </ul>
      </div>
    )
  }

  return (
    <div
      className={
        useNightInvertFallback
          ? 'nora-map-shell nora-map-shell--night-invert'
          : 'nora-map-shell'
      }
    >
      <div className="nora-map-badge" aria-hidden="true">
        <span className="nora-map-badge-dot" />
        2ГИС · рядом с вами
      </div>
      <div ref={containerRef} className="nora-map" />
    </div>
  )
}
