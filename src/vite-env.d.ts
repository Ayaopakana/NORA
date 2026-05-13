/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** Ключ MapGL 2ГИС: https://platform.2gis.ru/ */
  readonly VITE_2GIS_API_KEY?: string
  /** Опционально: ID стиля с https://styles.2gis.com */
  readonly VITE_2GIS_MAP_STYLE?: string
  /** Язык подписей карты (по умолчанию ru) */
  readonly VITE_2GIS_MAP_LANG?: string
  /**
   * Если true — без ночной инверсии canvas (остаётся дневной стиль MapGL по умолчанию).
   */
  readonly VITE_2GIS_MAP_NO_INVERT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
