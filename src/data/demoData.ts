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
    name: 'Aranya Corridor Reserve',
    polygon: [
      [12.025, 76.27],
      [11.995, 76.52],
      [12.025, 76.74],
      [11.875, 76.82],
      [11.625, 76.84],
      [11.375, 76.78],
      [11.195, 76.6],
      [11.175, 76.34],
      [11.325, 76.2],
      [11.675, 76.16],
    ],
  },
]

export const farmZones: FarmZone[] = [
  { id: 'F1', name: 'Rajapura Farm', center: [12.105, 76.52], radiusKm: 1.2 },
  { id: 'F2', name: 'Hosahalli Farm', center: [11.675, 76.84], radiusKm: 1.0 },
  { id: 'F3', name: 'Doddapalya Farm', center: [11.055, 76.46], radiusKm: 1.4 },
]

export const communities: Community[] = [
  { id: 'C1', name: 'Rajapura', center: [12.125, 76.53], preferredLanguage: 'English' },
  { id: 'C2', name: 'Hosahalli', center: [11.695, 76.85], preferredLanguage: 'Hindi' },
  { id: 'C3', name: 'Doddapalya', center: [11.045, 76.45], preferredLanguage: 'Hindi' },
]

export const sensors: Sensor[] = [
  { id: 'S1', name: 'North Corridor Gate', position: [12.005, 76.34], online: true },
  { id: 'S2', name: 'Northern Watch Post', position: [12.015, 76.52], online: true },
  { id: 'S3', name: 'North East Post', position: [11.995, 76.72], online: true },
  { id: 'S4', name: 'Eastern Ridge Post', position: [11.675, 76.8], online: true },
  { id: 'S5', name: 'Southern Patrol Post', position: [11.235, 76.52], online: true },
  { id: 'S6', name: 'Western Post', position: [11.525, 76.22], online: false },
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
      { lat: 11.475, lng: 76.24, ts: '2026-08-11T11:20:00Z' },
      { lat: 11.515, lng: 76.26, ts: '2026-08-11T12:20:00Z' },
      { lat: 11.555, lng: 76.28, ts: '2026-08-11T13:10:00Z' },
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
      { lat: 12.03, lng: 76.515, ts: '2026-08-11T17:52:00Z' },
      { lat: 12.048, lng: 76.518, ts: '2026-08-11T18:08:00Z' },
      { lat: 12.065, lng: 76.52, ts: '2026-08-11T18:20:00Z' },
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
      { lat: 11.525, lng: 76.47, ts: '2026-08-12T08:15:00Z' },
      { lat: 11.555, lng: 76.49, ts: '2026-08-12T08:45:00Z' },
      { lat: 11.585, lng: 76.51, ts: '2026-08-12T09:15:00Z' },
    ],
  },
  {
    event_id: 'EVT-1042',
    timestamp: '2026-08-12T18:42:00Z',
    sensor_zone: 'North Corridor',
    species: 'elephant',
    detection_confidence: 0.91,
    estimated_count: 5,
    distance_to_farm_km: 5.9,
    movement_toward_farm: true,
    movementKnown: true,
    historical_incidents_nearby: 3,
    weather_condition: 'dry_season',
    trail: [
      { lat: 12.03, lng: 76.515, ts: '2026-08-12T18:18:00Z' },
      { lat: 12.048, lng: 76.518, ts: '2026-08-12T18:30:00Z' },
      { lat: 12.068, lng: 76.52, ts: '2026-08-12T18:42:00Z' },
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
      { lat: 11.675, lng: 76.92, ts: '2026-08-12T18:37:00Z' },
      { lat: 11.675, lng: 76.904, ts: '2026-08-12T18:46:00Z' },
      { lat: 11.675, lng: 76.887, ts: '2026-08-12T18:55:00Z' },
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
      { lat: 11.625, lng: 76.62, ts: '2026-08-12T11:50:00Z' },
      { lat: 11.61, lng: 76.62, ts: '2026-08-12T12:13:00Z' },
      { lat: 11.595, lng: 76.62, ts: '2026-08-12T12:30:00Z' },
    ],
  },
  {
    event_id: 'EVT-1045',
    timestamp: '2026-08-12T23:05:00Z',
    sensor_zone: 'North East Corridor',
    species: 'leopard',
    detection_confidence: 0.52,
    estimated_count: 3,
    distance_to_farm_km: 4.0,
    movement_toward_farm: false,
    movementKnown: false,
    historical_incidents_nearby: 3,
    weather_condition: 'dry_season',
    trail: [{ lat: 12.125, lng: 76.558, ts: '2026-08-12T23:05:00Z' }],
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
      { lat: 11.705, lng: 76.87, ts: '2026-08-12T05:30:00Z' },
      { lat: 11.7, lng: 76.867, ts: '2026-08-12T05:35:00Z' },
      { lat: 11.693, lng: 76.864, ts: '2026-08-12T05:40:00Z' },
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