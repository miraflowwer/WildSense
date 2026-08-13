export type RiskLevel = 'low' | 'medium' | 'high'

export type EventStatus =
  | 'awaiting_review'
  | 'under_review'
  | 'monitoring'
  | 'escalated'
  | 'dismissed'
  | 'resolved'

export interface ContributionReason {
  /** Stable id used for localized labels; absent on rows loaded from the DB */
  key?: string
  label: string
  points: number
  description: string
}

export type UncertaintyWarning = 'recentMovement' | 'lowConfidence' | 'both'

export interface Uncertainty {
  penalty: number
  warning: UncertaintyWarning | null
}

export interface AuditTrailEntry {
  actor: string
  action: string
  at: string
}

export interface RangerProfile {
  userId: string
  name: string
  sector: string
  onDutySince: string
  lastActiveAt?: string
  lastAction?: string
}

export interface Subscriber {
  id: string
  name: string
  phone: string
  community: string
  consentGivenAt: string
  optedOut: boolean
}

export interface CorridorActivityZone {
  zone: string
  community: string
  riskLevel: RiskLevel
  count: number
  recentActivityAt: string
}

export interface InAppNotification {
  id: string
  title?: string
  message: string
  timestamp: string
  read: boolean
  eventId?: string
  actor?: string
}

export interface DetectionEvent {
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
  position: { lat: number; lng: number }
  trail: { lat: number; lng: number; ts: string }[]
  auditTrail?: AuditTrailEntry[]
  speed_kmh: number | null
  community: string
  risk_score: number
  risk_level: RiskLevel
  reasons: ContributionReason[]
  uncertainty: Uncertainty
  status: EventStatus
  acknowledgedAt: string | null
  rangerContactedAt: string | null
  owner: string | null
  outcome: OutcomeRecord | null
}

export interface OutcomeRecord {
  confirmed: boolean
  conflictPrevented: boolean
  actionTaken: string
  feedback: 'valid' | 'false'
  responseMinutes: number
  notes: string
}

export interface FarmZone {
  id: string
  name: string
  center: [number, number]
  radiusKm: number
}

export interface Community {
  id: string
  name: string
  center: [number, number]
  preferredLanguage: string
}

export interface Sensor {
  id: string
  name: string
  position: [number, number]
  online: boolean
}

export interface ZonePolygon {
  id: string
  name: string
  polygon: [number, number][]
}

export interface FilterState {
  species: string
  risk: string
  status: string
  zone: string
  community: string
}

export interface SmsReply {
  text: string
  at: string
}

export interface SmsState {
  openEventId: string | null
  sending: boolean
  sentAt: string | null
  delivered: number
  failed: number
  replies: SmsReply[]
  allClearSent: boolean
}

export interface Kpis {
  sensorsOnline: number
  sensorsTotal: number
  communitiesAffected: number
  avgResponseMinutes: number
}

export interface StoreState {
  events: DetectionEvent[]
  selectedId: string | null
  filter: FilterState
  railTab: 'alerts' | 'team'
  filtersExpanded: boolean
  sms: SmsState
  kpis: Kpis
  rangerName: string
  rangerSector: string
  lastSyncAt: string
  mode: 'demo' | 'user'
  notPersisted: boolean
  notifications: InAppNotification[]
  profiles: RangerProfile[]
  subscribers: Subscriber[]
  realEventsSnapshot?: DetectionEvent[]
  inTutorial?: boolean
}

export type StoreAction =
  | { type: 'SELECT_ALERT'; id: string }
  | { type: 'SET_RAIL_TAB'; tab: 'alerts' | 'team' }
  | { type: 'TOGGLE_FILTERS'; expanded?: boolean }
  | { type: 'SET_RANGER_NAME'; name: string }
  | { type: 'SET_RANGER_SECTOR'; sector: string }
  | { type: 'SET_SYNC'; at: string }
  | { type: 'CONTACT_RANGER'; id: string; actor?: string }
  | { type: 'ACKNOWLEDGE'; id: string; actor?: string }
  | { type: 'MONITOR'; id: string; actor?: string }
  | { type: 'ESCALATE'; id: string; actor?: string }
  | { type: 'MARK_FALSE'; id: string; note: string; actor?: string }
  | { type: 'RESOLVE'; id: string; outcome: OutcomeRecord; actor?: string }
  | { type: 'SET_FILTER'; patch: Partial<FilterState> }
  | { type: 'OPEN_SMS'; id: string }
  | { type: 'CLOSE_SMS' }
  | { type: 'SEND_SMS'; actor?: string }
  | { type: 'SMS_REPLY'; text: string }
  | { type: 'SEND_ALL_CLEAR'; actor?: string }
  | { type: 'RESET_DEMO' }
  | { type: 'SET_MODE'; mode: 'demo' | 'user' }
  | { type: 'HYDRATE_EVENTS'; events: DetectionEvent[]; rangerName: string }
  | { type: 'ADD_EVENT'; event: DetectionEvent }
  | { type: 'UPDATE_EVENT_REMOTE'; event: DetectionEvent }
  | { type: 'SET_PERSISTED'; ok: boolean }
  | { type: 'RESET_EVENT_STATUS'; id: string; status: EventStatus }
  | { type: 'CLEAR_RANGER_CONTACT'; id: string }
  | { type: 'START_TUTORIAL' }
  | { type: 'FINISH_TUTORIAL' }
  | { type: 'ADD_NOTIFICATION'; notification: InAppNotification }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_PROFILES'; profiles: RangerProfile[] }
  | { type: 'SET_SUBSCRIBERS'; subscribers: Subscriber[] }
  | { type: 'REMOVE_SUBSCRIBER'; id: string }
  | { type: 'APPEND_AUDIT_TRAIL'; eventId: string; entry: AuditTrailEntry }