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
  sms: SmsState
  kpis: Kpis
  rangerName: string
  lastSyncAt: string
  mode: 'demo' | 'user'
  notPersisted: boolean
  realEventsSnapshot?: DetectionEvent[]
  inTutorial?: boolean
}

export type StoreAction =
  | { type: 'SELECT_ALERT'; id: string }
  | { type: 'SET_RANGER_NAME'; name: string }
  | { type: 'SET_SYNC'; at: string }
  | { type: 'CONTACT_RANGER'; id: string }
  | { type: 'ACKNOWLEDGE'; id: string }
  | { type: 'MONITOR'; id: string }
  | { type: 'ESCALATE'; id: string }
  | { type: 'MARK_FALSE'; id: string; note: string }
  | { type: 'RESOLVE'; id: string; outcome: OutcomeRecord }
  | { type: 'SET_FILTER'; patch: Partial<FilterState> }
  | { type: 'OPEN_SMS'; id: string }
  | { type: 'CLOSE_SMS' }
  | { type: 'SEND_SMS' }
  | { type: 'SMS_REPLY'; text: string }
  | { type: 'SEND_ALL_CLEAR' }
  | { type: 'RESET_DEMO' }
  | { type: 'SET_MODE'; mode: 'demo' | 'user' }
  | { type: 'HYDRATE_EVENTS'; events: DetectionEvent[]; rangerName: string }
  | { type: 'ADD_EVENT'; event: DetectionEvent }
  | { type: 'SET_PERSISTED'; ok: boolean }
  | { type: 'RESET_EVENT_STATUS'; id: string; status: EventStatus }
  | { type: 'CLEAR_RANGER_CONTACT'; id: string }
  | { type: 'START_TUTORIAL' }
  | { type: 'FINISH_TUTORIAL' }