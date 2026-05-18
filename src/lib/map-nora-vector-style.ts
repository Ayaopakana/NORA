import type {
  ExpressionSpecification,
  LightSpecification,
  Map as MapLibreMap,
  StyleSpecification,
} from 'maplibre-gl'
import { NORA_MAP_DARK, NORA_MAP_LIGHT } from '@/lib/map-nora-palette'

const BUILDING_3D_ID = 'nora-buildings-3d'

/** ID векторного источника (OpenFreeMap — openmaptiles, иначе первый `vector` в стиле). */
function primaryVectorSourceId(map: MapLibreMap): string | undefined {
  const spec = map.getStyle().sources
  if (!spec) return undefined
  if ('openmaptiles' in spec && spec.openmaptiles) return 'openmaptiles'
  for (const [id, src] of Object.entries(spec)) {
    if (
      src &&
      typeof src === 'object' &&
      'type' in src &&
      (src as { type: string }).type === 'vector'
    ) {
      return id
    }
  }
  return undefined
}

/** Светлая тема — мягкий свет для экструзий. Тёмная — не перезаписываем light стиля (избегаем «чёрных домов»). */
function applyExtrusionLight(map: MapLibreMap, isDark: boolean) {
  const soft: LightSpecification = {
    anchor: 'viewport',
    color: '#ffffff',
    intensity: 0.07,
    position: [1.15, 200, 8],
  }
  try {
    if (isDark) {
      map.setLight({
        anchor: 'viewport',
        color: NORA_MAP_DARK.lightColor,
        intensity: 0.32,
        position: [1.15, 210, 32],
      })
      return
    }
    map.setLight(soft)
  } catch {
    /* */
  }
}

/** Убираем дубли 2D/3D building из базового стиля — оставляем только наш слой. */
function hideOtherBuildingLayers(map: MapLibreMap) {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.id === BUILDING_3D_ID) continue
    const sl =
      'source-layer' in layer &&
      typeof (layer as { 'source-layer'?: string })['source-layer'] ===
        'string'
        ? (layer as { 'source-layer': string })['source-layer']
        : undefined
    if (sl !== 'building') continue
    safeSetLayout(map, layer.id, 'visibility', 'none')
  }
}

/**
 * Куда вставить fill-extrusion: выше линий дорог, под подписями улиц.
 * Нельзя брать «первый symbol» — в dark это water_name *до* слоя building, и 3D окажется под всеми дорогами.
 */
function pickBuildings3dBeforeId(map: MapLibreMap): string | undefined {
  const layers = map.getStyle().layers ?? []
  const preferred = [
    'highway_name_other',
    'highway_name_motorway',
    'highway-name-path',
    'highway-name-minor',
    'highway-name-major',
  ]
  for (const id of preferred) {
    if (layers.some((l) => l.id === id)) return id
  }
  const buildingIdx = layers.findIndex((l) => l.id === 'building')
  if (buildingIdx >= 0) {
    for (let i = buildingIdx + 1; i < layers.length; i++) {
      if (layers[i].type === 'symbol') return layers[i].id
    }
  }
  return layers.find((l) => l.type === 'symbol')?.id
}

function safeSetPaint(
  map: MapLibreMap,
  layerId: string,
  prop: string,
  value: unknown,
) {
  try {
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, prop, value)
    }
  } catch {
    /* слой или свойство отличаются от ожидаемых */
  }
}

function safeSetLayout(
  map: MapLibreMap,
  layerId: string,
  prop: string,
  value: unknown,
) {
  try {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, prop, value)
    }
  } catch {
    /* */
  }
}

function stripFillPattern(map: MapLibreMap, layerId: string) {
  try {
    if (!map.getLayer(layerId)) return
    map.setPaintProperty(layerId, 'fill-pattern', '')
  } catch {
    /* слой без fill-pattern */
  }
}

/** Подписи — champagne / pearl, без холодного неона */
function applyDarkReadableLabels(map: MapLibreMap) {
  const p = NORA_MAP_DARK
  const street: [string, string, string][] = [
    ['highway_name_other', p.labelStreet, p.labelHalo],
    ['highway_name_motorway', p.labelStreetAlt, p.labelHalo],
  ]
  for (const [id, color, halo] of street) {
    safeSetPaint(map, id, 'text-color', color)
    safeSetPaint(map, id, 'text-halo-color', halo)
    safeSetPaint(map, id, 'text-halo-width', 1.25)
    safeSetPaint(map, id, 'text-halo-blur', 0.35)
  }

  safeSetPaint(map, 'water_name', 'text-color', p.labelWater)
  safeSetPaint(map, 'water_name', 'text-halo-color', p.labelWaterHalo)
  safeSetPaint(map, 'water_name', 'text-halo-width', 1)
}

/** Подписи дорог в светлом стиле Positron (hyphen в id). */
function applyLightReadableLabels(map: MapLibreMap) {
  const halo = 'rgba(255,255,255,0.92)'
  const labels: [string, string][] = [
    ['highway-name-minor', '#7a8499'],
    ['highway-name-major', '#5f6a7a'],
    ['highway-name-path', '#8a8580'],
  ]
  for (const [id, color] of labels) {
    safeSetPaint(map, id, 'text-color', color)
    safeSetPaint(map, id, 'text-halo-color', halo)
    safeSetPaint(map, id, 'text-halo-width', 1.25)
    safeSetPaint(map, id, 'text-halo-blur', 0.35)
  }

  for (const id of [
    'water_name_point_label',
    'water_name_line_label',
  ] as const) {
    safeSetPaint(map, id, 'text-color', '#6a7d88')
    safeSetPaint(map, id, 'text-halo-color', 'rgba(255,255,255,0.85)')
  }
}

function ensureBuildings3d(map: MapLibreMap, isDark: boolean) {
  const vectorId = primaryVectorSourceId(map)
  if (!vectorId || !map.getSource(vectorId)) return
  /* Не требуем базовый fill building в стиле: OMT вектор обычно отдаёт source-layer building даже если слой ещё не в spec в момент первого styledata. */

  hideOtherBuildingLayers(map)

  const heightExpr: ExpressionSpecification = [
    'max',
    [
      'coalesce',
      ['get', 'render_height'],
      ['*', ['to-number', ['get', 'height']], 3.6],
      14,
    ],
    2,
  ]

  const p = NORA_MAP_DARK
  const color = (
    isDark
      ? [
          'interpolate',
          ['linear'],
          ['get', 'render_height'],
          0,
          p.buildingLow,
          35,
          p.buildingMid,
          90,
          p.buildingHigh,
        ]
      : '#ebe8e4'
  ) as ExpressionSpecification

  const paint: Record<string, unknown> = {
    'fill-extrusion-color': color,
    'fill-extrusion-height': heightExpr,
    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
    'fill-extrusion-opacity': isDark ? 0.92 : 0.95,
    /* На светлой теме без градиента; на тёмной — как в базовом стиле (мягче силуэты). */
    'fill-extrusion-vertical-gradient': isDark,
  }

  const beforeId = pickBuildings3dBeforeId(map)

  if (map.getLayer(BUILDING_3D_ID)) {
    for (const [k, v] of Object.entries(paint)) {
      try {
        map.setPaintProperty(BUILDING_3D_ID, k, v as never)
      } catch {
        /* */
      }
    }
    safeSetLayout(map, BUILDING_3D_ID, 'visibility', 'visible')
    safeSetLayout(map, BUILDING_3D_ID, 'minzoom', 11)
    if (beforeId && beforeId !== BUILDING_3D_ID) {
      try {
        map.moveLayer(BUILDING_3D_ID, beforeId)
      } catch {
        /* */
      }
    }
    return
  }

  safeSetLayout(map, 'building', 'visibility', 'none')

  try {
    map.addLayer(
      {
        id: BUILDING_3D_ID,
        type: 'fill-extrusion',
        source: vectorId,
        'source-layer': 'building',
        minzoom: 11,
        filter: [
          'match',
          ['geometry-type'],
          ['Polygon', 'MultiPolygon'],
          true,
          false,
        ],
        paint,
      },
      beforeId,
    )
  } catch {
    safeSetLayout(map, 'building', 'visibility', 'visible')
  }
}

/**
 * Тёмная тема — только читабельные подписи + вода (остальное как у NORA).
 * Светлая — реально светлая подложка и цветные дороги, не «белое + чёрное».
 */
export function applyNoraVectorMapStyle(map: MapLibreMap, isDark: boolean) {
  if (!map.isStyleLoaded()) return
  const vectorId = primaryVectorSourceId(map)
  if (!vectorId || !map.getSource(vectorId)) return

  if (isDark) {
    const p = NORA_MAP_DARK
    safeSetPaint(map, 'background', 'background-color', p.background)
    safeSetPaint(map, 'landuse_residential', 'fill-color', p.landResidential)
    safeSetPaint(map, 'park', 'fill-color', p.park)
    safeSetPaint(map, 'landuse_park', 'fill-color', p.landusePark)
    stripFillPattern(map, 'landcover_wood')
    safeSetPaint(map, 'landcover_wood', 'fill-color', p.wood)
    safeSetPaint(map, 'landcover_grass', 'fill-color', p.grass)
    safeSetPaint(map, 'water', 'fill-color', p.water)

    safeSetPaint(map, 'highway_motorway_inner', 'line-color', p.motorwayInner)
    safeSetPaint(map, 'highway_motorway_bridge_inner', 'line-color', p.motorwayInner)
    safeSetPaint(map, 'tunnel_motorway_inner', 'line-color', p.tunnelMotorway)
    safeSetPaint(map, 'highway_motorway_casing', 'line-color', p.motorwayCasing)
    safeSetPaint(map, 'highway_motorway_bridge_casing', 'line-color', p.motorwayCasing)

    safeSetPaint(map, 'highway_major_inner', 'line-color', p.majorInner)
    safeSetPaint(map, 'highway_major_subtle', 'line-color', p.majorSubtle)
    safeSetPaint(map, 'highway_major_casing', 'line-color', p.majorCasing)

    safeSetPaint(map, 'highway_minor', 'line-color', p.minor)
    safeSetPaint(map, 'highway_path', 'line-color', p.path)

    applyDarkReadableLabels(map)
  } else {
    const p = NORA_MAP_LIGHT
    safeSetPaint(map, 'background', 'background-color', p.background)
    safeSetPaint(map, 'landuse_residential', 'fill-color', p.landResidential)
    safeSetPaint(map, 'park', 'fill-color', p.park)
    safeSetPaint(map, 'landuse_park', 'fill-color', p.landusePark)
    stripFillPattern(map, 'landcover_wood')
    safeSetPaint(map, 'landcover_wood', 'fill-color', p.wood)
    safeSetPaint(map, 'landcover_grass', 'fill-color', p.grass)
    safeSetPaint(map, 'water', 'fill-color', p.water)

    /* Дороги — серо-голубой, ближе к нейтральному серому */
    safeSetPaint(map, 'highway_motorway_inner', 'line-color', '#7d95a3')
    safeSetPaint(map, 'highway_motorway_bridge_inner', 'line-color', '#7d95a3')
    safeSetPaint(map, 'tunnel_motorway_inner', 'line-color', '#8aa0ae')
    safeSetPaint(map, 'highway_motorway_casing', 'line-color', '#6b7f8c')
    safeSetPaint(map, 'highway_motorway_bridge_casing', 'line-color', '#6b7f8c')
    safeSetPaint(map, 'highway_motorway_subtle', 'line-color', '#a3b4bf')

    safeSetPaint(map, 'highway_major_inner', 'line-color', '#dce6ed')
    safeSetPaint(map, 'highway_major_subtle', 'line-color', '#b0c0cc')
    safeSetPaint(map, 'highway_major_casing', 'line-color', '#7a8f9c')

    safeSetPaint(map, 'highway_minor', 'line-color', '#adbdc8')
    safeSetPaint(map, 'highway_path', 'line-color', '#a6b4c0')

    safeSetPaint(map, 'road_pier', 'line-color', '#bfcad3')
    safeSetPaint(map, 'road_area_pier', 'fill-color', '#dee6ec')

    applyLightReadableLabels(map)
  }

  ensureBuildings3d(map, isDark)
  applyExtrusionLight(map, isDark)
}
