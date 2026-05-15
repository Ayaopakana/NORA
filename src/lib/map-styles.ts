import type { StyleSpecification } from 'maplibre-gl'

/**
 * Светлый векторный стиль + инверсия в CSS (nora-map-dark).
 * Даёт заметно выше контраст, чем нативный OpenFreeMap «dark».
 */
export const OPENFREEMAP_DARK =
  'https://tiles.openfreemap.org/styles/liberty'

/** Светлый стиль — если включена светлая тема приложения. */
export const OPENFREEMAP_LIGHT =
  'https://tiles.openfreemap.org/styles/liberty'

/** Запасной тёмный растр (CARTO Dark Matter). */
export const CARTO_DARK_FALLBACK: StyleSpecification = {
  version: 8,
  sources: {
    cartoDark: {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© CARTO © OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'carto-dark',
      type: 'raster',
      source: 'cartoDark',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

/** Запасной светлый растр (OSM). */
export const OSM_LIGHT_FALLBACK: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

export function mapStyleForTheme(theme: string | undefined): string {
  return theme === 'light' ? OPENFREEMAP_LIGHT : OPENFREEMAP_DARK
}

export function mapFallbackForTheme(
  theme: string | undefined,
): StyleSpecification {
  return theme === 'light' ? OSM_LIGHT_FALLBACK : CARTO_DARK_FALLBACK
}
