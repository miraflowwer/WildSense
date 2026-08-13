import type { SupabaseClient } from '@supabase/supabase-js'
import type { DetectionEvent, EventStatus, RiskLevel } from '../types'
import { supabase } from './supabase'

interface EventRow {
  event_id: string
  happened_at: string
  sensor_zone: string
  species: string
  detection_confidence: number
  estimated_count: number
  distance_to_farm_km: number
  movement_toward_farm: boolean
  movement_known: boolean
  historical_incidents_nearby: number
  weather_condition: string
  lat: number
  lng: number
  community: string
  risk_score: number
  risk_level: string
  status: string
  acknowledged_at: string | null
  ranger_contacted_at: string | null
  owner_name: string | null
  outcome: DetectionEvent['outcome'] | null
  reasons: DetectionEvent['reasons'] | null
  uncertainty: DetectionEvent['uncertainty'] | null
  trail: DetectionEvent['trail'] | null
}

function requireClient(): SupabaseClient {
  if (!supabase) throw new Error('Server unreachable')
  return supabase
}

async function currentUserId(): Promise<string> {
  const { data, error } = await requireClient().auth.getUser()
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Not signed in')
  return data.user.id
}

function rowToEvent(row: EventRow): DetectionEvent {
  const riskLevel: RiskLevel =
    row.risk_level === 'low' || row.risk_level === 'medium' || row.risk_level === 'high'
      ? row.risk_level
      : 'medium'
  const status: EventStatus =
    row.status === 'awaiting_review' ||
    row.status === 'under_review' ||
    row.status === 'monitoring' ||
    row.status === 'escalated' ||
    row.status === 'dismissed' ||
    row.status === 'resolved'
      ? row.status
      : 'awaiting_review'
  return {
    event_id: row.event_id,
    timestamp: row.happened_at,
    sensor_zone: row.sensor_zone,
    species: row.species,
    detection_confidence: Number(row.detection_confidence),
    estimated_count: Number(row.estimated_count),
    distance_to_farm_km: Number(row.distance_to_farm_km),
    movement_toward_farm: row.movement_toward_farm,
    movementKnown: row.movement_known,
    historical_incidents_nearby: Number(row.historical_incidents_nearby),
    weather_condition: row.weather_condition,
    position: { lat: Number(row.lat), lng: Number(row.lng) },
    trail: row.trail ?? [],
    speed_kmh: null,
    community: row.community ?? '',
    risk_score: Number(row.risk_score),
    risk_level: riskLevel,
    reasons: row.reasons ?? [],
    uncertainty:
      row.uncertainty && typeof row.uncertainty.penalty === 'number'
        ? row.uncertainty
        : { penalty: 0, warning: null },
    status,
    acknowledgedAt: row.acknowledged_at ?? null,
    rangerContactedAt: row.ranger_contacted_at ?? null,
    owner: row.owner_name ?? null,
    outcome: row.outcome ?? null,
  }
}

export async function loadEvents(): Promise<DetectionEvent[]> {
  const db = requireClient()
  const { data, error } = await db
    .from('events')
    .select('*')
    .order('happened_at', { ascending: false })
  if (error) {
    console.error('[GAHM API Error] loadEvents failed:', error.message, error)
    throw new Error(error.message)
  }
  const rows = (data ?? []) as unknown as EventRow[]
  return rows.map(rowToEvent)
}

export async function seedUserEvents(events: DetectionEvent[]): Promise<void> {
  const db = requireClient()
  const ownerId = await currentUserId()
  const rows = events.map((event) => ({
    event_id: event.event_id,
    owner_id: ownerId,
    happened_at: event.timestamp,
    sensor_zone: event.sensor_zone,
    species: event.species,
    detection_confidence: event.detection_confidence,
    estimated_count: event.estimated_count,
    distance_to_farm_km: event.distance_to_farm_km,
    movement_toward_farm: event.movement_toward_farm,
    movement_known: event.movementKnown,
    historical_incidents_nearby: event.historical_incidents_nearby,
    weather_condition: event.weather_condition,
    lat: event.position.lat,
    lng: event.position.lng,
    trail: event.trail,
    community: event.community,
    risk_score: event.risk_score,
    risk_level: event.risk_level,
    reasons: event.reasons,
    uncertainty: event.uncertainty,
    status: event.status,
    acknowledged_at: event.acknowledgedAt,
    ranger_contacted_at: event.rangerContactedAt,
    owner_name: event.owner,
    outcome: event.outcome,
  }))
  const { error } = await db.from('events').insert(rows)
  if (error) {
    console.error('[GAHM API Error] seedUserEvents failed:', error.message, error)
    throw new Error(error.message)
  }
}

export async function insertEvent(event: DetectionEvent): Promise<void> {
  const db = requireClient()
  const ownerId = await currentUserId()
  const { error } = await db.from('events').insert({
    event_id: event.event_id,
    owner_id: ownerId,
    happened_at: event.timestamp,
    sensor_zone: event.sensor_zone,
    species: event.species,
    detection_confidence: event.detection_confidence,
    estimated_count: event.estimated_count,
    distance_to_farm_km: event.distance_to_farm_km,
    movement_toward_farm: event.movement_toward_farm,
    movement_known: event.movementKnown,
    historical_incidents_nearby: event.historical_incidents_nearby,
    weather_condition: event.weather_condition,
    lat: event.position.lat,
    lng: event.position.lng,
    trail: event.trail,
    community: event.community,
    risk_score: event.risk_score,
    risk_level: event.risk_level,
    reasons: event.reasons,
    uncertainty: event.uncertainty,
    status: event.status,
    acknowledged_at: event.acknowledgedAt,
    ranger_contacted_at: event.rangerContactedAt,
    owner_name: event.owner,
    outcome: event.outcome,
  })
  if (error) {
    console.error('[GAHM API Error] insertEvent failed:', error.message, error)
    throw new Error(error.message)
  }
}

export async function updateEvent(eventId: string, patch: Record<string, unknown>): Promise<void> {
  const db = requireClient()
  const { error } = await db.from('events').update(patch).eq('event_id', eventId)
  if (error) {
    console.error('[GAHM API Error] updateEvent failed:', error.message, error)
    throw new Error(error.message)
  }
}

export async function insertSmsLog(entry: {
  eventId: string
  message: string
  delivered: number
  failed: number
  allClear: boolean
}): Promise<void> {
  const db = requireClient()
  const ownerId = await currentUserId()
  const { error } = await db.from('sms_log').insert({
    owner_id: ownerId,
    event_id: entry.eventId,
    message: entry.message,
    delivered: entry.delivered,
    failed: entry.failed,
    all_clear: entry.allClear,
  })
  if (error) {
    console.error('[GAHM API Error] insertSmsLog failed:', error.message, error)
    throw new Error(error.message)
  }
}

export async function loadUserLanguage(): Promise<string | null> {
  const db = requireClient()
  const userId = await currentUserId()
  const { data, error } = await db
    .from('user_settings')
    .select('preferred_language')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.error('[GAHM API Error] loadUserLanguage failed:', error.message, error)
    throw new Error(error.message)
  }
  return data?.preferred_language ?? null
}

export async function saveUserLanguage(lang: string): Promise<void> {
  const db = requireClient()
  const userId = await currentUserId()
  const { error } = await db
    .from('user_settings')
    .upsert({ user_id: userId, preferred_language: lang }, { onConflict: 'user_id' })
  if (error) {
    console.error('[GAHM API Error] saveUserLanguage failed:', error.message, error)
    throw new Error(error.message)
  }
}