import type {
  RiskLevel,
  DetectionEvent,
  OutcomeRecord,
  FarmZone,
  Community,
  Sensor,
  ZonePolygon,
} from '../types'
import { computeRisk } from '../engine/riskEngine'
import { thresholdsForZone } from '../engine/config'
import { haversineKm } from '../engine/geo'

export const USER = { name: 'Ranger Demo' }

export const riskLevelColor: Record<RiskLevel, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
}

export const zones: ZonePolygon[] = [
  {
    id: 'Z1',
    name: 'Kijani Reserve',
    polygon: [
      [-2.55, 37.95],
      [-2.58, 38.2],
      [-2.55, 38.42],
      [-2.7, 38.5],
      [-2.95, 38.52],
      [-3.2, 38.46],
      [-3.38, 38.28],
      [-3.4, 38.02],
      [-3.25, 37.88],
      [-2.9, 37.84],
    ],
  },
]

export const farmZones: FarmZone[] = [
  { id: 'F1', name: 'North Farm', center: [-2.47, 38.2], radiusKm: 1.2 },
  { id: 'F2', name: 'East Farm', center: [-2.9, 38.52], radiusKm: 1.0 },
  { id: 'F3', name: 'Mwamba South Farm', center: [-3.52, 38.14], radiusKm: 1.4 },
]

export const communities: Community[] = [
  { id: 'C1', name: 'North Village', center: [-2.45, 38.21], preferredLanguage: 'English' },
  { id: 'C2', name: 'Kilima East', center: [-2.88, 38.53], preferredLanguage: 'Kiswahili' },
  { id: 'C3', name: 'Mwamba South', center: [-3.53, 38.13], preferredLanguage: 'Kiswahili' },
]

export const sensors: Sensor[] = [
  { id: 'S1', name: 'North Gate', position: [-2.57, 38.02], online: true },
  { id: 'S2', name: 'Northern Post', position: [-2.56, 38.2], online: true },
  { id: 'S3', name: 'North East Post', position: [-2.58, 38.4], online: true },
  { id: 'S4', name: 'East Ridge', position: [-2.9, 38.48], online: true },
  { id: 'S5', name: 'South Patrol', position: [-3.34, 38.2], online: true },
  { id: 'S6', name: 'West Post', position: [-3.05, 37.9], online: false },
]

export interface RawTrailPoint {
  lat: number
  lng: number
  ts: string
}

export interface RawDetection {
  event_id: string
  timestamp: string
  sensor_zone: string
  species: string
  detection_confidence: number
  estimated_count: number
  distance_to_farm_km: number
  movement_toward_farm: boolean
  movementKnown: boolean
  historical_incidents_nearby: number
  weather_condition: string
  trail: RawTrailPoint[]
  status?: DetectionEvent['status']
  acknowledgedAt?: string | null
  rangerContactedAt?: string | null
  owner?: string | null
  outcome?: OutcomeRecord | null
}

const rawDets: RawDetection[] = [
  {
    event_id: 'EVT-1038',
    timestamp: '2026-08-11T13:10:00Z',
    sensor_zone: 'West Patrol',
    species: 'elephant',
    detection_confidence: 0.79,
    estimated_count: 2,
    distance_to_farm_km: 8.4,
    movement_toward_farm: false,
    movementKnown: true,
    historical_incidents_nearby: 0,
    weather_condition: 'clear',
    trail: [
      { lat: -3.1, lng: 37.92, ts: '2026-08-11T11:20:00Z' },
      { lat: -3.06, lng: 37.94, ts: '2026-08-11T12:20:00Z' },
      { lat: -3.02, lng: 37.96, ts: '2026-08-11T13:10:00Z' },
    ],
    status: 'dismissed',
    outcome: {
      confirmed: false,
      conflictPrevented: false,
      actionTaken: 'None',
      feedback: 'false',
      responseMinutes: 0,
      notes: 'Detection was dust haze.',
    },
  },
  {
    event_id: 'EVT-1040',
    timestamp: '2026-08-11T18:20:00Z',
    sensor_zone: 'North Boundary',
    species: 'elephant',
    detection_confidence: 0.9,
    estimated_count: 3,
    distance_to_farm_km: 2.4,
    movement_toward_farm: true,
    movementKnown: true,
    historical_incidents_nearby: 2,
    weather_condition: 'dry',
    trail: [
      { lat: -2.545, lng: 38.195, ts: '2026-08-11T17:52:00Z' },
      { lat: -2.527, lng: 38.198, ts: '2026-08-11T18:08:00Z' },
      { lat: -2.51, lng: 38.2, ts: '2026-08-11T18:20:00Z' },
    ],
    status: 'resolved',
    acknowledgedAt: '2026-08-11T18:25:00Z',
    owner: USER.name,
    outcome: {
      confirmed: true,
      conflictPrevented: true,
      actionTaken: 'SMS warning + ranger patrol',
      feedback: 'valid',
      responseMinutes: 14,
      notes: 'De-escalated before crop damage.',
    },
  },
  {
    event_id: 'EVT-1041',
    timestamp: '2026-08-12T09:15:00Z',
    sensor_zone: 'Reserve Interior',
    species: 'elephant',
    detection_confidence: 0.88,
    estimated_count: 1,
    distance_to_farm_km: 11.2,
    movement_toward_farm: false,
    movementKnown: true,
    historical_incidents_nearby: 0,
    weather_condition: 'clear',
    trail: [
      { lat: -3.05, lng: 38.15, ts: '2026-08-12T08:15:00Z' },
      { lat: -3.02, lng: 38.17, ts: '2026-08-12T08:45:00Z' },
      { lat: -2.99, lng: 38.19, ts: '2026-08-12T09:15:00Z' },
    ],
  },
  {
    event_id: 'EVT-1042',
    timestamp: '2026-08-12T18:42:00Z',
    sensor_zone: 'North Boundary',
    species: 'elephant',
    detection_confidence: 0.91,
    estimated_count: 5,
    distance_to_farm_km: 5.9,
    movement_toward_farm: true,
    movementKnown: true,
    historical_incidents_nearby: 3,
    weather_condition: 'dry',
    trail: [
      { lat: -2.545, lng: 38.195, ts: '2026-08-12T18:18:00Z' },
      { lat: -2.527, lng: 38.198, ts: '2026-08-12T18:30:00Z' },
      { lat: -2.507, lng: 38.2, ts: '2026-08-12T18:42:00Z' },
    ],
  },
  {
    event_id: 'EVT-1043',
    timestamp: '2026-08-12T18:55:00Z',
    sensor_zone: 'East Boundary',
    species: 'elephant',
    detection_confidence: 0.9,
    estimated_count: 4,
    distance_to_farm_km: 4.2,
    movement_toward_farm: true,
    movementKnown: true,
    historical_incidents_nearby: 2,
    weather_condition: 'dry',
    trail: [
      { lat: -2.9, lng: 38.6, ts: '2026-08-12T18:37:00Z' },
      { lat: -2.9, lng: 38.584, ts: '2026-08-12T18:46:00Z' },
      { lat: -2.9, lng: 38.567, ts: '2026-08-12T18:55:00Z' },
    ],
  },
  {
    event_id: 'EVT-1044',
    timestamp: '2026-08-12T12:30:00Z',
    sensor_zone: 'Reserve Interior',
    species: 'elephant',
    detection_confidence: 0.83,
    estimated_count: 1,
    distance_to_farm_km: 9.6,
    movement_toward_farm: false,
    movementKnown: true,
    historical_incidents_nearby: 0,
    weather_condition: 'clear',
    trail: [
      { lat: -2.95, lng: 38.3, ts: '2026-08-12T11:50:00Z' },
      { lat: -2.965, lng: 38.3, ts: '2026-08-12T12:13:00Z' },
      { lat: -2.98, lng: 38.3, ts: '2026-08-12T12:30:00Z' },
    ],
  },
  {
    event_id: 'EVT-1045',
    timestamp: '2026-08-12T23:05:00Z',
    sensor_zone: 'North East',
    species: 'hyena',
    detection_confidence: 0.52,
    estimated_count: 3,
    distance_to_farm_km: 4.0,
    movement_toward_farm: false,
    movementKnown: false,
    historical_incidents_nearby: 3,
    weather_condition: 'dry',
    trail: [{ lat: -2.45, lng: 38.238, ts: '2026-08-12T23:05:00Z' }],
  },
  {
    event_id: 'EVT-1046',
    timestamp: '2026-08-12T05:40:00Z',
    sensor_zone: 'East Boundary',
    species: 'elephant',
    detection_confidence: 0.93,
    estimated_count: 6,
    distance_to_farm_km: 5.2,
    movement_toward_farm: true,
    movementKnown: true,
    historical_incidents_nearby: 2,
    weather_condition: 'dry',
    trail: [
      { lat: -2.87, lng: 38.55, ts: '2026-08-12T05:30:00Z' },
      { lat: -2.875, lng: 38.547, ts: '2026-08-12T05:35:00Z' },
      { lat: -2.882, lng: 38.544, ts: '2026-08-12T05:40:00Z' },
    ],
  },
]

export function buildDemoState(): DetectionEvent[] {
  return rawDets.map((raw) => {
    const trail = raw.trail.map((t) => ({ ...t }))
    const last = trail[trail.length - 1]
    const risk = computeRisk(
      {
        species: raw.species,
        detection_confidence: raw.detection_confidence,
        estimated_count: raw.estimated_count,
        distance_to_farm_km: raw.distance_to_farm_km,
        movement_toward_farm: raw.movement_toward_farm,
        movementKnown: raw.movementKnown,
        historical_incidents_nearby: raw.historical_incidents_nearby,
        weather_condition: raw.weather_condition,
        trailLength: trail.length,
        hour: new Date(raw.timestamp).getUTCHours(),
      },
      thresholdsForZone(raw.sensor_zone),
    )
    const speed_kmh = estimateSpeedKmh(trail)
    const community = nearestCommunityName(last)
    return {
      event_id: raw.event_id,
      timestamp: raw.timestamp,
      sensor_zone: raw.sensor_zone,
      species: raw.species,
      detection_confidence: raw.detection_confidence,
      estimated_count: raw.estimated_count,
      distance_to_farm_km: raw.distance_to_farm_km,
      movement_toward_farm: raw.movement_toward_farm,
      movementKnown: raw.movementKnown,
      historical_incidents_nearby: raw.historical_incidents_nearby,
      weather_condition: raw.weather_condition,
      position: { lat: last.lat, lng: last.lng },
      trail,
      speed_kmh,
      community,
      risk_score: risk.risk_score,
      risk_level: risk.risk_level,
      reasons: risk.reasons,
      uncertainty: risk.uncertainty,
      status: raw.status ?? 'awaiting_review',
      acknowledgedAt: raw.acknowledgedAt ?? null,
      rangerContactedAt: raw.rangerContactedAt ?? null,
      owner: raw.owner ?? null,
      outcome: raw.outcome ?? null,
    }
  })
}

function estimateSpeedKmh(
  trail: RawTrailPoint[],
): number | null {
  if (trail.length < 2) return null
  const [a, b] = [trail[trail.length - 2], trail[trail.length - 1]]
  const dKm = haversineKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng })
  const dHours =
    (Date.parse(b.ts) - Date.parse(a.ts)) / (1000 * 60 * 60)
  if (!Number.isFinite(dHours) || dHours <= 0) return null
  return Math.max(0, dKm / dHours)
}

export function nearestCommunityName(position: { lat: number; lng: number }): string {
  let best = communities[0].name
  let bestDist = Infinity
  for (const c of communities) {
    const d = haversineKm(position, { lat: c.center[0], lng: c.center[1] })
    if (d < bestDist) {
      bestDist = d
      best = c.name
    }
  }
  return best
}

export const events: DetectionEvent[] = buildDemoState()