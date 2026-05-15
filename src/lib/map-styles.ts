import type { StyleSpecification } from 'maplibre-gl'

/**
 * Светлая тема — Positron: чистые пастельные тона, меньше визуального шума.
 * @see https://openfreemap.org/
 */
export const OPENFREEMAP_LIGHT = 'https://tiles.openfreemap.org/styles/positron'

/**
 * Тёмная_theme — нативный тёмный стиль (без CSS-invert поверх Liberty).
 */
export const OPENFREEMAP_DARK = 'https://tiles.openfreemap.org/styles/dark'

/** Запасной тёмный растр — Dark Matter (мягче с лёгким тонингом в CSS). */
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

/** Запасной светлый растр — Voyager (приятнее сырых OSM-тайлов). */
export const CARTO_LIGHT_FALLBACK: StyleSpecification = {
  version: 8,
  sources: {
    voyager: {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© CARTO © OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'voyager',
      type: 'raster',
      source: 'voyager',
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
  return theme === 'light' ? CARTO_LIGHT_FALLBACK : CARTO_DARK_FALLBACK
}
