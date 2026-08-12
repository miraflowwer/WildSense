export const WEIGHTS = {
  proximity: 25,
  movement: 20,
  species: 15,
  history: 15,
  timeOfDay: 10,
  groupSize: 10,
  weather: 5,
} as const

export const THRESHOLDS = {
  low: 40,
  high: 70,
} as const

export interface RiskThresholds {
  low: number
  high: number
}

export const RESERVE_THRESHOLDS: Record<string, RiskThresholds> = {
  'Kijani Reserve': { low: 40, high: 70 },
}

export function thresholdsForReserve(reserve: string): RiskThresholds {
  return RESERVE_THRESHOLDS[reserve] ?? THRESHOLDS
}

const SENSOR_ZONE_TO_RESERVE: Record<string, string> = {
  'West Patrol': 'Kijani Reserve',
  'North Boundary': 'Kijani Reserve',
  'Reserve Interior': 'Kijani Reserve',
  'East Boundary': 'Kijani Reserve',
  'North East': 'Kijani Reserve',
}

export function thresholdsForZone(sensorZone: string): RiskThresholds {
  return thresholdsForReserve(SENSOR_ZONE_TO_RESERVE[sensorZone] ?? 'Kijani Reserve')
}

export const MAX_PROXIMITY_KM = 12

export const SPECIES_IMPACT: Record<string, number> = {
  elephant: 15,
  hippo: 14,
  lion: 12,
  buffalo: 12,
  hyena: 10,
  zebra: 5,
  impala: 3,
  gazelle: 3,
}

export const TIME_WINDOWS = {
  duskStart: 17,
  duskEnd: 20,
  dawnStart: 5,
  dawnEnd: 8,
} as const

export const WEATHER_FACTOR: Record<string, number> = {
  drought: 5,
  dry: 5,
  fog: 4,
  clear: 3,
  rain: 2,
}

export const GROUP_SIZE_POINTS: Record<number, number> = {
  1: 2,
  2: 4,
  3: 5,
  4: 7,
  5: 8,
  6: 9,
}

export const MAX_GROUP_SIZE_POINTS = 10