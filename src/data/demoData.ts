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
  low: '#2563eb',
  medium: '#f59e0b',
  high: '#ef4444',
}

export const zones: ZonePolygon[] = [
  {
    id: 'Z1',
    name: 'Aranya Corridor Reserve',
    polygon: [
      [12.02, 76.16],
      [12.1, 76.38],
      [11.97, 76.55],
      [11.9, 76.75],
      [11.8, 76.85],
      [11.68, 76.78],
      [11.55, 76.76],
      [11.42, 76.58],
      [11.47, 76.36],
      [11.72, 76.18],
      [11.96, 76.12],
    ],
  },
]

export const farmZones: FarmZone[] = [
  { id: 'F1', name: 'Kabini Farm', center: [11.955, 76.353], radiusKm: 1.2 },
  { id: 'F2', name: 'Bandipur Farm', center: [11.738, 76.648], radiusKm: 1.0 },
  { id: 'F3', name: 'Moyar Valley Farm', center: [11.583, 76.635], radiusKm: 1.4 },
]

export const communities: Community[] = [
  { id: 'C1', name: 'Beechanahalli', center: [11.9735, 76.3528], preferredLanguage: 'Kannada' },
  { id: 'C2', name: 'Hangala', center: [11.7471, 76.6504], preferredLanguage: 'Kannada' },
  { id: 'C3', name: 'Masinagudi', center: [11.5722, 76.6427], preferredLanguage: 'Tamil' },
]

export const sensors: Sensor[] = [
  { id: 'S1', name: 'North Corridor Gate', position: [11.995, 76.33], online: true },
  { id: 'S2', name: 'Northern Watch Post', position: [12.075, 76.36], online: true },
  { id: 'S3', name: 'North East Post', position: [11.95, 76.6], online: true },
  { id: 'S4', name: 'Eastern Ridge Post', position: [11.8, 76.76], online: true },
  { id: 'S5', name: 'Southern Patrol Post', position: [11.51, 76.6], online: true },
  { id: 'S6', name: 'Western Post', position: [11.95, 76.2], online: false },
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
    sensor_zone: 'Western Patrol',
    species: 'elephant',
    detection_confidence: 0.79,
    estimated_count: 2,
    distance_to_farm_km: 8.4,
    movement_toward_farm: false,
    movementKnown: true,
    historical_incidents_nearby: 0,
    weather_condition: 'clear',
    trail: [
      { lat: 11.875, lng: 76.24, ts: '2026-08-11T11:20:00Z' },
      { lat: 11.905, lng: 76.26, ts: '2026-08-11T12:20:00Z' },
      { lat: 11.935, lng: 76.28, ts: '2026-08-11T13:10:00Z' },
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
    sensor_zone: 'North Corridor',
    species: 'elephant',
    detection_confidence: 0.9,
    estimated_count: 3,
    distance_to_farm_km: 2.4,
    movement_toward_farm: true,
    movementKnown: true,
    historical_incidents_nearby: 2,
    weather_condition: 'dry_season',
    trail: [
      { lat: 11.905, lng: 76.35, ts: '2026-08-11T17:52:00Z' },
      { lat: 11.919, lng: 76.351, ts: '2026-08-11T18:08:00Z' },
      { lat: 11.933, lng: 76.353, ts: '2026-08-11T18:20:00Z' },
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
      { lat: 11.985, lng: 76.3, ts: '2026-08-12T08:15:00Z' },
      { lat: 12.005, lng: 76.29, ts: '2026-08-12T08:45:00Z' },
      { lat: 12.025, lng: 76.28, ts: '2026-08-12T09:15:00Z' },
    ],
  },
  {
    event_id: 'EVT-1042',
    timestamp: '2026-08-12T18:42:00Z',
    sensor_zone: 'Bandipur Gate',
    species: 'elephant',
    detection_confidence: 0.91,
    estimated_count: 5,
    distance_to_farm_km: 5.9,
    movement_toward_farm: true,
    movementKnown: true,
    historical_incidents_nearby: 3,
    weather_condition: 'dry_season',
    trail: [
      { lat: 11.645, lng: 76.64, ts: '2026-08-12T18:18:00Z' },
      { lat: 11.665, lng: 76.642, ts: '2026-08-12T18:30:00Z' },
      { lat: 11.685, lng: 76.644, ts: '2026-08-12T18:42:00Z' },
    ],
  },
  {
    event_id: 'EVT-1043',
    timestamp: '2026-08-12T18:55:00Z',
    sensor_zone: 'Eastern Buffer',
    species: 'elephant',
    detection_confidence: 0.9,
    estimated_count: 4,
    distance_to_farm_km: 4.2,
    movement_toward_farm: true,
    movementKnown: true,
    historical_incidents_nearby: 2,
    weather_condition: 'dry_season',
    trail: [
      { lat: 11.735, lng: 76.686, ts: '2026-08-12T18:37:00Z' },
      { lat: 11.745, lng: 76.684, ts: '2026-08-12T18:46:00Z' },
      { lat: 11.755, lng: 76.682, ts: '2026-08-12T18:55:00Z' },
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
      { lat: 11.835, lng: 76.645, ts: '2026-08-12T11:50:00Z' },
      { lat: 11.829, lng: 76.646, ts: '2026-08-12T12:13:00Z' },
      { lat: 11.824, lng: 76.648, ts: '2026-08-12T12:30:00Z' },
    ],
  },
  {
    event_id: 'EVT-1045',
    timestamp: '2026-08-12T23:05:00Z',
    sensor_zone: 'Moyar Valley Corridor',
    species: 'leopard',
    detection_confidence: 0.52,
    estimated_count: 3,
    distance_to_farm_km: 4.0,
    movement_toward_farm: false,
    movementKnown: false,
    historical_incidents_nearby: 3,
    weather_condition: 'dry_season',
    trail: [{ lat: 11.547, lng: 76.635, ts: '2026-08-12T23:05:00Z' }],
  },
  {
    event_id: 'EVT-1046',
    timestamp: '2026-08-12T05:40:00Z',
    sensor_zone: 'Eastern Buffer',
    species: 'elephant',
    detection_confidence: 0.93,
    estimated_count: 6,
    distance_to_farm_km: 5.2,
    movement_toward_farm: true,
    movementKnown: true,
    historical_incidents_nearby: 2,
    weather_condition: 'dry_season',
    trail: [
      { lat: 11.705, lng: 76.7, ts: '2026-08-12T05:30:00Z' },
      { lat: 11.717, lng: 76.697, ts: '2026-08-12T05:35:00Z' },
      { lat: 11.73, lng: 76.694, ts: '2026-08-12T05:40:00Z' },
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
