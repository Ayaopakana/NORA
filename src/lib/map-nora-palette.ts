/**
 * Палитра карты NORA — согласована с --nora-* в globals.css
 * @see src/app/globals.css
 */

export const NORA_MAP_DARK = {
  background: '#1a1824',
  landResidential: '#1e1c28',
  park: '#2a3d36',
  landusePark: '#263a38',
  wood: '#243430',
  grass: '#283832',
  water: '#2a3848',
  motorwayInner: '#6a8494',
  motorwayCasing: '#3a4248',
  tunnelMotorway: '#5f7888',
  majorInner: '#3d4554',
  majorSubtle: '#4a5568',
  majorCasing: '#454f5c',
  minor: '#525c6a',
  path: '#5a6470',
  labelStreet: '#ddd4c8',
  labelStreetAlt: '#b8c4d4',
  labelHalo: 'rgba(26, 24, 38, 0.92)',
  labelWater: '#94a8b8',
  labelWaterHalo: 'rgba(26, 24, 38, 0.8)',
  buildingLow: '#2e3442',
  buildingMid: '#3d4554',
  buildingHigh: '#5c6678',
  lightColor: '#f5f0e8',
} as const

export const NORA_MAP_LIGHT = {
  background: '#f0eeeb',
  landResidential: '#e8e4df',
  park: '#bdd8cc',
  landusePark: '#b0ddd4',
  wood: '#8fd4b8',
  grass: '#9fdcc4',
  water: '#b8ccd8',
} as const

export const NORA_MAP_ROUTE_DARK = {
  glow: '#b8c4d4',
  line: '#d4c4a8',
  arrowFill: '#f5f3f0',
  arrowStroke: '#8e9aae',
} as const

export const NORA_MAP_ROUTE_LIGHT = {
  glow: '#8eb4d4',
  line: '#8e9aae',
  arrowFill: '#ffffff',
  arrowStroke: '#6a8494',
} as const
