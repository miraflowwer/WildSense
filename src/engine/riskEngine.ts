import {
  THRESHOLDS,
  MAX_PROXIMITY_KM,
  SPECIES_IMPACT,
  formatSpeciesName,
  TIME_WINDOWS,
  WEATHER_FACTOR,
  WEATHER_DESCRIPTIONS,
  GROUP_SIZE_POINTS,
  MAX_GROUP_SIZE_POINTS,
  type RiskThresholds,
} from './config'
import type {
  RiskLevel,
  ContributionReason,
  Uncertainty,
  UncertaintyWarning,
  DetectionEvent,
} from '../types'

export interface RiskInput {
  species: string
  detection_confidence: number
  estimated_count: number
  distance_to_farm_km: number
  movement_toward_farm: boolean
  movementKnown: boolean
  historical_incidents_nearby: number
  weather_condition: string
  trailLength: number
  hour: number
}

export interface RiskResult {
  risk_score: number
  risk_level: RiskLevel
  reasons: ContributionReason[]
  uncertainty: Uncertainty
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function computeRisk(
  input: RiskInput,
  thresholds: RiskThresholds = THRESHOLDS,
): RiskResult {
  const reasons: ContributionReason[] = []

  const d = input.distance_to_farm_km
  const proximity =
    d <= 1
      ? 25
      : d >= MAX_PROXIMITY_KM
        ? 0
        : Math.round((25 * (MAX_PROXIMITY_KM - d)) / (MAX_PROXIMITY_KM - 1))
  if (proximity > 0) {
    reasons.push({
      key: 'proximity',
      label: 'Proximity to farms',
      points: proximity,
      description: `${d.toFixed(1)} km from the nearest farm boundary`,
    })
  }

  const movement = input.movementKnown
    ? input.movement_toward_farm
      ? 20
      : 6
    : 0
  if (movement > 0) {
    reasons.push({
      key: input.movement_toward_farm ? 'movement_toward' : 'movement_away',
      label: input.movement_toward_farm
        ? 'Movement toward boundary'
        : 'Movement away',
      points: movement,
      description: input.movement_toward_farm
        ? 'Heading toward farmland based on recent detections'
        : 'Moving away from populated areas',
    })
  }

  const speciesKey = input.species.toLowerCase().trim().replace(/\s+/g, '_')
  const speciesPts = SPECIES_IMPACT[speciesKey] ?? SPECIES_IMPACT[input.species] ?? 10
  if (speciesPts > 0) {
    reasons.push({
      key: 'species',
      label: 'Species impact',
      points: speciesPts,
      description: `${formatSpeciesName(input.species)} has high conflict potential in this habitat`,
    })
  }

  const history = Math.min(15, input.historical_incidents_nearby * 5)
  if (history > 0) {
    reasons.push({
      key: 'history',
      label: 'Historical conflict hotspot',
      points: history,
      description: `${input.historical_incidents_nearby} previous incident${
        input.historical_incidents_nearby === 1 ? '' : 's'
      } recorded nearby`,
    })
  }

  const hour = input.hour
  const inPeak =
    (hour >= TIME_WINDOWS.duskStart && hour < TIME_WINDOWS.duskEnd) ||
    (hour >= TIME_WINDOWS.dawnStart && hour < TIME_WINDOWS.dawnEnd)
  const timeOfDay = inPeak ? 10 : 3
  if (timeOfDay > 0) {
    reasons.push({
      key: inPeak ? 'time_peak' : 'time_outside',
      label: 'High-risk time window',
      points: timeOfDay,
      description: inPeak
        ? 'Detection during the dusk/dawn activity peak'
        : 'Outside the peak activity window',
    })
  }

  const group = Math.min(
    MAX_GROUP_SIZE_POINTS,
    GROUP_SIZE_POINTS[input.estimated_count] ?? MAX_GROUP_SIZE_POINTS,
  )
  if (group > 0) {
    reasons.push({
      key: 'group',
      label: 'Group size',
      points: group,
      description: `Estimated group of ${input.estimated_count} animals`,
    })
  }

  const weather = WEATHER_FACTOR[input.weather_condition] ?? 2
  if (weather > 0) {
    reasons.push({
      key: 'weather',
      label: 'Weather / seasonal',
      points: weather,
      description:
        WEATHER_DESCRIPTIONS[input.weather_condition] ?? 'Typical seasonal conditions',
    })
  }

  const warnings: UncertaintyWarning[] = []
  let penalty = 0
  if (!input.movementKnown) {
    penalty += 8
    warnings.push('recentMovement')
  }
  if (input.detection_confidence < 0.6) {
    penalty += 5
    warnings.push('lowConfidence')
  }

  const uncertainty: Uncertainty = {
    penalty,
    warning:
      warnings.length === 0
        ? null
        : warnings.length === 1
          ? warnings[0]
          : 'both',
  }
  if (penalty > 0) {
    reasons.push({
      key: 'uncertainty',
      label: 'Data uncertainty adjustment',
      points: -penalty,
      description: warnings.length
        ? 'Risk uncertain: recent movement data is unavailable. Manual review recommended.'
        : 'Missing or uncertain data',
    })
  }

  const total = reasons.reduce((sum, r) => sum + r.points, 0)
  const risk_score = clamp(total, 0, 100)
  const risk_level: RiskLevel =
    risk_score >= thresholds.high
      ? 'high'
      : risk_score >= thresholds.low
        ? 'medium'
        : 'low'

  return {
    risk_score,
    risk_level,
    reasons,
    uncertainty,
  }
}

export function suggestNextAction(
  event: Pick<DetectionEvent, 'risk_level' | 'risk_score'>,
): string {
  if (event.risk_level === 'high') {
    return 'Contact the nearest ranger unit and prepare a community SMS warning.'
  }
  if (event.risk_level === 'medium') {
    return 'Add to monitoring; schedule a field check.'
  }
  return 'Log event; no action needed.'
}