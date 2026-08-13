import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  DetectionEvent,
  EventStatus,
  RiskLevel,
  RangerProfile,
  Subscriber,
  CorridorActivityZone,
  AuditTrailEntry,
} from '../types'
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
  audit_trail?: AuditTrailEntry[] | null
}

function requireClient(): SupabaseClient {
  if (!supabase) throw new Error('Server unreachable')
  return supabase
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase)
}

async function currentUserId(): Promise<string> {
  const { data, error } = await requireClient().auth.getUser()
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Not signed in')
  return data.user.id
}

export function rowToEvent(row: EventRow): DetectionEvent {
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
    auditTrail: row.audit_trail ?? [],
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
    audit_trail: event.auditTrail ?? [],
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
    audit_trail: event.auditTrail ?? [],
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

export async function appendEventAudit(
  eventId: string,
  entry: AuditTrailEntry,
  existingAuditTrail: AuditTrailEntry[] = [],
): Promise<void> {
  const db = requireClient()
  const updated = [...existingAuditTrail, entry]
  const { error } = await db.from('events').update({ audit_trail: updated }).eq('event_id', eventId)
  if (error) {
    console.error('[GAHM API Error] appendEventAudit failed:', error.message, error)
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

/* =========================================================================
   PROFILES API (Ranger Roster & Team View)
   ========================================================================= */

interface ProfileRow {
  user_id: string
  name: string
  sector: string | null
  on_duty_since: string
}

export async function loadProfiles(): Promise<RangerProfile[]> {
  const db = requireClient()
  const { data, error } = await db.from('profiles').select('*').order('on_duty_since', { ascending: false })
  if (error) {
    console.error('[GAHM API Error] loadProfiles failed:', error.message, error)
    return []
  }
  return ((data ?? []) as ProfileRow[]).map((r) => ({
    userId: r.user_id,
    name: r.name,
    sector: r.sector || 'Central Corridor',
    onDutySince: r.on_duty_since,
  }))
}

export async function upsertProfile(name: string, sector = 'Central Corridor'): Promise<void> {
  const db = requireClient()
  const userId = await currentUserId()
  const { error } = await db.from('profiles').upsert(
    {
      user_id: userId,
      name,
      sector,
      on_duty_since: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) {
    console.error('[GAHM API Error] upsertProfile failed:', error.message, error)
  }
}

/* =========================================================================
   SUBSCRIBERS API (DPDP §6 Consent Self-Subscription & Dispatch List)
   ========================================================================= */

interface SubscriberRow {
  id: string
  name: string
  phone: string
  community: string
  consent_given_at: string
  opted_out: boolean
}

export async function loadSubscribers(community?: string): Promise<Subscriber[]> {
  const db = requireClient()
  let query = db.from('subscribers').select('*').eq('opted_out', false)
  if (community) {
    query = query.eq('community', community)
  }
  const { data, error } = await query
  if (error) {
    console.error('[GAHM API Error] loadSubscribers failed:', error.message, error)
    return []
  }
  return ((data ?? []) as SubscriberRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    community: r.community,
    consentGivenAt: r.consent_given_at,
    optedOut: r.opted_out,
  }))
}

export async function subscribeVillager(params: {
  name: string
  phone: string
  community: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Database not connected' }
  const { error } = await supabase.from('subscribers').upsert(
    {
      name: params.name.trim(),
      phone: params.phone.trim(),
      community: params.community,
      consent_given_at: new Date().toISOString(),
      terms_version: '2026-08-14',
      opted_out: false,
    },
    { onConflict: 'phone' },
  )
  if (error) {
    console.error('[GAHM API Error] subscribeVillager failed:', error.message, error)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  const db = requireClient()
  const { error } = await db.from('subscribers').delete().eq('id', id)
  if (error) {
    console.error('[GAHM API Error] deleteSubscriber failed:', error.message, error)
    return false
  }
  return true
}

/* =========================================================================
   PUBLIC SANITIZED CORRIDOR ACTIVITY (For Landing Page)
   ========================================================================= */

interface CorridorActivityRow {
  zone: string
  community: string
  risk_level: string
  detection_count: number
  recent_activity_at: string
}

export async function loadCorridorActivity(): Promise<CorridorActivityZone[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('corridor_activity').select('*')
  if (error) {
    console.error('[GAHM API Error] loadCorridorActivity failed:', error.message, error)
    return []
  }
  return ((data ?? []) as CorridorActivityRow[]).map((r) => ({
    zone: r.zone,
    community: r.community,
    riskLevel: (r.risk_level === 'high' || r.risk_level === 'low' ? r.risk_level : 'medium') as RiskLevel,
    count: r.detection_count,
    recentActivityAt: r.recent_activity_at,
  }))
}