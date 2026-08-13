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
  'Aranya Corridor Reserve': { low: 40, high: 70 },
}

export function thresholdsForReserve(reserve: string): RiskThresholds {
  return RESERVE_THRESHOLDS[reserve] ?? THRESHOLDS
}

const SENSOR_ZONE_TO_RESERVE: Record<string, string> = {
  'Western Patrol': 'Aranya Corridor Reserve',
  'North Corridor': 'Aranya Corridor Reserve',
  'Reserve Interior': 'Aranya Corridor Reserve',
  'Eastern Buffer': 'Aranya Corridor Reserve',
  'North East Corridor': 'Aranya Corridor Reserve',
}

export function thresholdsForZone(sensorZone: string): RiskThresholds {
  return thresholdsForReserve(SENSOR_ZONE_TO_RESERVE[sensorZone] ?? 'Aranya Corridor Reserve')
}

export const MAX_PROXIMITY_KM = 12

export const SPECIES_IMPACT: Record<string, number> = {
  elephant: 15,
  tiger: 14,
  snow_leopard: 13,
  leopard: 13,
  sloth_bear: 11,
  wolf: 10,
  gaur: 10,
  wild_boar: 8,
}

export function formatSpeciesName(species: string): string {
  if (!species) return ''
  const cleaned = species.replace(/_/g, ' ').trim()
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const TIME_WINDOWS = {
  duskStart: 17,
  duskEnd: 20,
  dawnStart: 5,
  dawnEnd: 8,
} as const

export const WEATHER_FACTOR: Record<string, number> = {
  dry_season: 5,
  post_monsoon: 5,
  pre_monsoon: 4,
  clear: 3,
  monsoon: 2,
}

export function formatWeatherName(weather: string): string {
  if (!weather) return ''
  const cleaned = weather.replace(/_/g, ' ').trim()
  return cleaned
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase()
      if (lower === 'pre' || lower === 'post') {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + '-'
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
    .replace(/-\s+/g, '-')
}

export const WEATHER_DESCRIPTIONS: Record<string, string> = {
  dry_season: 'Dry season conditions push wildlife toward water and farmland',
  post_monsoon: 'Post-monsoon: fresh vegetation and full water sources draw wildlife to farm edges',
  pre_monsoon: 'Pre-monsoon heat and shrinking water sources push wildlife toward farmland',
  monsoon: 'Monsoon rains keep water plentiful and shift wildlife movement patterns',
  clear: 'Typical seasonal conditions',
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