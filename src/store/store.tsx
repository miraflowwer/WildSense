import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type {
  StoreState,
  StoreAction,
  DetectionEvent,
  OutcomeRecord,
  Kpis,
  SmsState,
  RangerProfile,
  InAppNotification,
  Subscriber,
  AuditTrailEntry,
} from '../types'
import { buildDemoState, sensors, farmZones, USER } from '../data/demoData'
import { haversineKm } from '../engine/geo'
import { useAuth } from '../auth/authContext'
import {
  loadEvents,
  insertEvent,
  updateEvent,
  appendEventAudit,
  loadProfiles,
  upsertProfile,
  loadSubscribers,
  deleteSubscriber,
} from '../auth/api'
import { supabase } from '../auth/supabase'
import { StoreContext, type StoreContextValue } from './storeContext'

const EMPTY_SMS: SmsState = {
  openEventId: null,
  sending: false,
  sentAt: null,
  delivered: 0,
  failed: 0,
  replies: [],
  allClearSent: false,
}

const SEED_PROFILES: RangerProfile[] = [
  {
    userId: 'demo-p1',
    name: 'K. Rao',
    sector: 'Masinagudi',
    onDutySince: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    lastAction: 'Acknowledged EVT-1043',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    userId: 'demo-p2',
    name: 'S. Gowda',
    sector: 'Hangala',
    onDutySince: new Date(Date.now() - 3600000 * 4.2).toISOString(),
    lastAction: 'Patrol dispatched for EVT-1040',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    userId: 'demo-p3',
    name: 'P. Naik',
    sector: 'Beechanahalli',
    onDutySince: new Date(Date.now() - 3600000 * 2.1).toISOString(),
    lastAction: 'Monitoring EVT-1045',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
  },
  {
    userId: 'demo-p4',
    name: USER.name,
    sector: 'Central Corridor',
    onDutySince: new Date(Date.now() - 3600000 * 1).toISOString(),
    lastAction: 'Active on Duty',
    lastActiveAt: new Date().toISOString(),
  },
]

const SEED_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'seed-notif-1',
    message: 'K. Rao acknowledged EVT-1043 (Elephant herd in Masinagudi sector)',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    read: false,
    actor: 'K. Rao',
    eventId: 'EVT-1043',
  },
]

const SEED_SUBSCRIBERS: Subscriber[] = [
  {
    id: 'sub-1',
    name: 'R. Sharma',
    phone: '+91 98450 10221',
    community: 'Hangala',
    consentGivenAt: '2026-08-10T09:00:00Z',
    optedOut: false,
  },
  {
    id: 'sub-2',
    name: 'S. Gowda',
    phone: '+91 98450 10334',
    community: 'Hangala',
    consentGivenAt: '2026-08-10T09:15:00Z',
    optedOut: false,
  },
  {
    id: 'sub-3',
    name: 'A. Kumar',
    phone: '+91 98450 10457',
    community: 'Hangala',
    consentGivenAt: '2026-08-11T10:00:00Z',
    optedOut: false,
  },
  {
    id: 'sub-4',
    name: 'P. Naik',
    phone: '+91 98450 10582',
    community: 'Beechanahalli',
    consentGivenAt: '2026-08-11T11:30:00Z',
    optedOut: false,
  },
  {
    id: 'sub-5',
    name: 'M. Hegde',
    phone: '+91 98450 10603',
    community: 'Beechanahalli',
    consentGivenAt: '2026-08-12T08:20:00Z',
    optedOut: false,
  },
  {
    id: 'sub-6',
    name: 'K. Rao',
    phone: '+91 98450 10776',
    community: 'Masinagudi',
    consentGivenAt: '2026-08-12T08:45:00Z',
    optedOut: false,
  },
]

function seedEventsWithAudit(): DetectionEvent[] {
  const events = buildDemoState()
  return events.map((e) => {
    const audit: AuditTrailEntry[] = []
    if (e.event_id === 'EVT-1040') {
      audit.push(
        { actor: 'S. Gowda', action: 'Acknowledged alert', at: '2026-08-12T14:15:00Z' },
        { actor: 'S. Gowda', action: 'Contacted field patrol unit', at: '2026-08-12T14:20:00Z' },
        { actor: 'S. Gowda', action: 'Sent community warning SMS (5 delivered)', at: '2026-08-12T14:25:00Z' },
        { actor: 'S. Gowda', action: 'Resolved: De-escalated before crop damage', at: '2026-08-12T14:45:00Z' },
      )
    } else if (e.event_id === 'EVT-1043') {
      audit.push({ actor: 'K. Rao', action: 'Acknowledged alert', at: '2026-08-12T20:18:00Z' })
    } else if (e.event_id === 'EVT-1045') {
      audit.push({ actor: 'P. Naik', action: 'Initiated active monitoring', at: '2026-08-12T21:05:00Z' })
    }
    return { ...e, auditTrail: audit }
  })
}

function computeKpis(events: DetectionEvent[]): Kpis {
  const sensorsOnline = sensors.filter((s) => s.online).length
  const communitiesAffected = farmZones.filter((z) =>
    events.some(
      (e) =>
        e.status !== 'dismissed' &&
        e.status !== 'resolved' &&
        haversineKm(
          { lat: e.position.lat, lng: e.position.lng },
          { lat: z.center[0], lng: z.center[1] },
        ) -
          z.radiusKm <=
          5,
    ),
  ).length
  const outcomes = events.filter((e) => e.outcome != null)
  const avgResponseMinutes = outcomes.length
    ? Math.round(
        outcomes.reduce(
          (sum, e) => sum + (e.outcome as OutcomeRecord).responseMinutes,
          0,
        ) / outcomes.length,
      )
    : 0
  return {
    sensorsOnline,
    sensorsTotal: sensors.length,
    communitiesAffected,
    avgResponseMinutes,
  }
}

function initialState(mode: 'demo' | 'user'): StoreState {
  const events = mode === 'demo' ? seedEventsWithAudit() : []
  return {
    events,
    selectedId: null,
    filter: { species: '', risk: '', status: 'awaiting_review', zone: '', community: '' },
    railTab: 'alerts',
    filtersExpanded: false,
    sms: { ...EMPTY_SMS },
    kpis: computeKpis(events),
    rangerName: mode === 'demo' ? USER.name : '',
    rangerSector: 'Central Corridor',
    lastSyncAt: new Date().toISOString(),
    mode,
    notPersisted: false,
    notifications: mode === 'demo' ? [...SEED_NOTIFICATIONS] : [],
    profiles: mode === 'demo' ? [...SEED_PROFILES] : [],
    subscribers: mode === 'demo' ? [...SEED_SUBSCRIBERS] : [],
  }
}

function appendAudit(
  events: DetectionEvent[],
  eventId: string,
  entry: AuditTrailEntry,
): DetectionEvent[] {
  return events.map((e) =>
    e.event_id === eventId
      ? { ...e, auditTrail: [...(e.auditTrail ?? []), entry] }
      : e,
  )
}

function updateProfileActivity(
  profiles: RangerProfile[],
  actorName: string,
  actionText: string,
): RangerProfile[] {
  const existing = profiles.find((p) => p.name === actorName)
  if (!existing) {
    return [
      ...profiles,
      {
        userId: `usr-${Date.now()}`,
        name: actorName,
        sector: 'Central Corridor',
        onDutySince: new Date().toISOString(),
        lastAction: actionText,
        lastActiveAt: new Date().toISOString(),
      },
    ]
  }
  return profiles.map((p) =>
    p.name === actorName
      ? { ...p, lastAction: actionText, lastActiveAt: new Date().toISOString() }
      : p,
  )
}

function reducer(state: StoreState, action: StoreAction): StoreState {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SELECT_ALERT':
      return { ...state, selectedId: action.id }

    case 'SET_RAIL_TAB':
      return { ...state, railTab: action.tab }

    case 'TOGGLE_FILTERS':
      return {
        ...state,
        filtersExpanded: action.expanded !== undefined ? action.expanded : !state.filtersExpanded,
      }

    case 'SET_RANGER_NAME':
      return { ...state, rangerName: action.name.trim() || USER.name }

    case 'SET_RANGER_SECTOR':
      return { ...state, rangerSector: action.sector.trim() || 'Central Corridor' }

    case 'SET_SYNC':
      return { ...state, lastSyncAt: action.at }

    case 'CONTACT_RANGER': {
      const actor = action.actor || state.rangerName
      const entry: AuditTrailEntry = {
        actor,
        action: 'Contacted field patrol unit',
        at: now,
      }
      const updatedEvents = state.events.map((e) =>
        e.event_id === action.id
          ? {
              ...e,
              rangerContactedAt: e.rangerContactedAt ?? now,
              owner: e.owner ?? actor,
              auditTrail: [...(e.auditTrail ?? []), entry],
            }
          : e,
      )
      return {
        ...state,
        events: updatedEvents,
        profiles: updateProfileActivity(state.profiles, actor, `Contacted patrol for ${action.id}`),
      }
    }

    case 'ACKNOWLEDGE': {
      const actor = action.actor || state.rangerName
      const entry: AuditTrailEntry = {
        actor,
        action: 'Claimed and acknowledged alert',
        at: now,
      }
      const updatedEvents = state.events.map((e) =>
        e.event_id === action.id
          ? {
              ...e,
              status: 'under_review' as const,
              owner: actor,
              acknowledgedAt: e.acknowledgedAt ?? now,
              auditTrail: [...(e.auditTrail ?? []), entry],
            }
          : e,
      )
      return {
        ...state,
        events: updatedEvents,
        profiles: updateProfileActivity(state.profiles, actor, `Acknowledged ${action.id}`),
      }
    }

    case 'MONITOR': {
      const actor = action.actor || state.rangerName
      const entry: AuditTrailEntry = {
        actor,
        action: 'Marked for continuous active monitoring',
        at: now,
      }
      const updatedEvents = state.events.map((e) =>
        e.event_id === action.id
          ? {
              ...e,
              status: 'monitoring' as const,
              owner: e.owner ?? actor,
              auditTrail: [...(e.auditTrail ?? []), entry],
            }
          : e,
      )
      return {
        ...state,
        events: updatedEvents,
        profiles: updateProfileActivity(state.profiles, actor, `Monitoring ${action.id}`),
      }
    }

    case 'ESCALATE': {
      const actor = action.actor || state.rangerName
      const entry: AuditTrailEntry = {
        actor,
        action: 'Escalated priority to maximum alert level',
        at: now,
      }
      const updatedEvents = state.events.map((e) =>
        e.event_id === action.id
          ? {
              ...e,
              status: 'escalated' as const,
              auditTrail: [...(e.auditTrail ?? []), entry],
            }
          : e,
      )
      return {
        ...state,
        events: updatedEvents,
        profiles: updateProfileActivity(state.profiles, actor, `Escalated ${action.id}`),
      }
    }

    case 'MARK_FALSE': {
      const actor = action.actor || state.rangerName
      const entry: AuditTrailEntry = {
        actor,
        action: `Dismissed as false alert: "${action.note}"`,
        at: now,
      }
      const updatedEvents = state.events.map((e) =>
        e.event_id === action.id
          ? {
              ...e,
              status: 'dismissed' as const,
              auditTrail: [...(e.auditTrail ?? []), entry],
              outcome: {
                confirmed: false,
                conflictPrevented: false,
                actionTaken: 'None',
                feedback: 'false' as const,
                responseMinutes: 0,
                notes: action.note,
              },
            }
          : e,
      )
      return {
        ...state,
        events: updatedEvents,
        profiles: updateProfileActivity(state.profiles, actor, `Dismissed ${action.id}`),
      }
    }

    case 'RESOLVE': {
      const actor = action.actor || state.rangerName
      const entry: AuditTrailEntry = {
        actor,
        action: `Resolved incident (${action.outcome.actionTaken}): "${action.outcome.notes}"`,
        at: now,
      }
      const updatedEvents = state.events.map((e) =>
        e.event_id === action.id
          ? {
              ...e,
              status: 'resolved' as const,
              outcome: action.outcome,
              auditTrail: [...(e.auditTrail ?? []), entry],
            }
          : e,
      )
      return {
        ...state,
        events: updatedEvents,
        profiles: updateProfileActivity(state.profiles, actor, `Resolved ${action.id}`),
      }
    }

    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.patch },
      }

    case 'OPEN_SMS':
      return {
        ...state,
        sms: {
          openEventId: action.id,
          sending: false,
          sentAt: null,
          delivered: 0,
          failed: 0,
          replies: [],
          allClearSent: false,
        },
      }

    case 'CLOSE_SMS':
      return { ...state, sms: { ...state.sms, openEventId: null } }

    case 'SEND_SMS': {
      const actor = action.actor || state.rangerName
      let nextEvents = state.events
      if (state.sms.openEventId) {
        const entry: AuditTrailEntry = {
          actor,
          action: 'Dispatched community early warning SMS',
          at: now,
        }
        nextEvents = appendAudit(state.events, state.sms.openEventId, entry)
      }
      return {
        ...state,
        events: nextEvents,
        sms: {
          ...state.sms,
          sending: true,
          sentAt: now,
          delivered: 5,
          failed: 1,
        },
        profiles: updateProfileActivity(state.profiles, actor, 'Sent Community SMS Warning'),
      }
    }

    case 'SMS_REPLY':
      return {
        ...state,
        sms: {
          ...state.sms,
          replies: [
            ...state.sms.replies,
            { text: action.text, at: now },
          ],
        },
      }

    case 'SEND_ALL_CLEAR': {
      const actor = action.actor || state.rangerName
      let nextEvents = state.events
      if (state.sms.openEventId) {
        const entry: AuditTrailEntry = {
          actor,
          action: 'Sent all-clear notification to community',
          at: now,
        }
        nextEvents = appendAudit(state.events, state.sms.openEventId, entry)
      }
      return {
        ...state,
        events: nextEvents,
        sms: { ...state.sms, allClearSent: true },
        profiles: updateProfileActivity(state.profiles, actor, 'Sent All-Clear notification'),
      }
    }

    case 'SET_MODE': {
      const next = initialState(action.mode)
      if (state.inTutorial) {
        return {
          ...next,
          inTutorial: true,
          realEventsSnapshot: state.realEventsSnapshot,
          events: seedEventsWithAudit(),
        }
      }
      return next
    }

    case 'HYDRATE_EVENTS': {
      if (state.inTutorial) {
        return {
          ...state,
          realEventsSnapshot: action.events,
          rangerName: action.rangerName.trim() || USER.name,
          lastSyncAt: now,
          notPersisted: false,
        }
      }
      return {
        ...state,
        events: action.events,
        rangerName: action.rangerName.trim() || USER.name,
        lastSyncAt: now,
        notPersisted: false,
      }
    }

    case 'ADD_EVENT':
      return {
        ...state,
        events: [action.event, ...state.events],
        selectedId: action.event.event_id,
      }

    case 'UPDATE_EVENT_REMOTE': {
      const existing = state.events.some((e) => e.event_id === action.event.event_id)
      const nextEvents = existing
        ? state.events.map((e) => (e.event_id === action.event.event_id ? action.event : e))
        : [action.event, ...state.events]
      return {
        ...state,
        events: nextEvents,
      }
    }

    case 'SET_PERSISTED':
      return { ...state, notPersisted: !action.ok }

    case 'RESET_EVENT_STATUS':
      return {
        ...state,
        events: state.events.map((e) =>
          e.event_id === action.id ? { ...e, status: action.status } : e,
        ),
      }

    case 'CLEAR_RANGER_CONTACT':
      return {
        ...state,
        events: state.events.map((e) =>
          e.event_id === action.id ? { ...e, rangerContactedAt: null } : e,
        ),
      }

    case 'START_TUTORIAL': {
      return {
        ...state,
        realEventsSnapshot: state.inTutorial ? state.realEventsSnapshot : state.events,
        events: seedEventsWithAudit(),
        inTutorial: true,
        selectedId: null,
      }
    }

    case 'FINISH_TUTORIAL': {
      if (!state.inTutorial) return state
      const restoredEvents = state.realEventsSnapshot ?? []
      return {
        ...state,
        events: restoredEvents,
        realEventsSnapshot: undefined,
        inTutorial: false,
        selectedId: null,
      }
    }

    case 'RESET_DEMO': {
      const next = initialState(state.mode)
      if (state.inTutorial) {
        return {
          ...next,
          inTutorial: true,
          events: seedEventsWithAudit(),
        }
      }
      return next
    }

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      }

    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      }

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      }

    case 'SET_PROFILES':
      return {
        ...state,
        profiles: action.profiles,
      }

    case 'SET_SUBSCRIBERS':
      return {
        ...state,
        subscribers: action.subscribers,
      }

    case 'REMOVE_SUBSCRIBER':
      return {
        ...state,
        subscribers: state.subscribers.filter((s) => s.id !== action.id),
      }

    case 'APPEND_AUDIT_TRAIL':
      return {
        ...state,
        events: appendAudit(state.events, action.eventId, action.entry),
      }

    default:
      return state
  }
}

function persistAction(action: StoreAction, s: StoreState): Promise<void> | null {
  const actor = s.rangerName || USER.name
  const now = new Date().toISOString()

  switch (action.type) {
    case 'ACKNOWLEDGE': {
      const existing = s.events.find((e) => e.event_id === action.id)
      const entry: AuditTrailEntry = { actor, action: 'Claimed and acknowledged alert', at: now }
      const newAudit = [...(existing?.auditTrail ?? []), entry]
      return updateEvent(action.id, {
        status: 'under_review',
        acknowledged_at: now,
        owner_name: actor,
        audit_trail: newAudit,
      })
    }

    case 'CONTACT_RANGER': {
      const existing = s.events.find((e) => e.event_id === action.id)
      const entry: AuditTrailEntry = { actor, action: 'Contacted field patrol unit', at: now }
      const newAudit = [...(existing?.auditTrail ?? []), entry]
      return updateEvent(action.id, {
        ranger_contacted_at: existing?.rangerContactedAt ?? now,
        owner_name: existing?.owner ?? actor,
        audit_trail: newAudit,
      })
    }

    case 'MONITOR': {
      const existing = s.events.find((e) => e.event_id === action.id)
      const entry: AuditTrailEntry = { actor, action: 'Marked for continuous active monitoring', at: now }
      const newAudit = [...(existing?.auditTrail ?? []), entry]
      return updateEvent(action.id, {
        status: 'monitoring',
        owner_name: existing?.owner ?? actor,
        audit_trail: newAudit,
      })
    }

    case 'ESCALATE': {
      const existing = s.events.find((e) => e.event_id === action.id)
      const entry: AuditTrailEntry = { actor, action: 'Escalated priority to maximum alert level', at: now }
      const newAudit = [...(existing?.auditTrail ?? []), entry]
      return updateEvent(action.id, {
        status: 'escalated',
        audit_trail: newAudit,
      })
    }

    case 'MARK_FALSE': {
      const existing = s.events.find((e) => e.event_id === action.id)
      const entry: AuditTrailEntry = { actor, action: `Dismissed as false alert: "${action.note}"`, at: now }
      const newAudit = [...(existing?.auditTrail ?? []), entry]
      return updateEvent(action.id, {
        status: 'dismissed',
        audit_trail: newAudit,
        outcome: {
          confirmed: false,
          conflictPrevented: false,
          actionTaken: 'None',
          feedback: 'false',
          responseMinutes: 0,
          notes: action.note,
        },
      })
    }

    case 'RESOLVE': {
      const existing = s.events.find((e) => e.event_id === action.id)
      const entry: AuditTrailEntry = {
        actor,
        action: `Resolved incident (${action.outcome.actionTaken}): "${action.outcome.notes}"`,
        at: now,
      }
      const newAudit = [...(existing?.auditTrail ?? []), entry]
      return updateEvent(action.id, {
        status: 'resolved',
        outcome: action.outcome,
        audit_trail: newAudit,
      })
    }

    case 'ADD_EVENT':
      return insertEvent(action.event)

    case 'APPEND_AUDIT_TRAIL': {
      const existing = s.events.find((e) => e.event_id === action.eventId)
      return appendEventAudit(action.eventId, action.entry, existing?.auditTrail)
    }

    case 'REMOVE_SUBSCRIBER':
      return deleteSubscriber(action.id).then(() => {})

    default:
      return null
  }
}

export function GahmProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [state, rawDispatch] = useReducer(reducer, undefined, () => initialState('user'))
  const stateRef = useRef(state)
  stateRef.current = state

  const prevAuthModeRef = useRef<'demo' | 'user' | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  // BroadcastChannel setup for synchronized 2-window demo experience
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel('wildsense-demo-sync')
    channelRef.current = channel

    channel.onmessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') return

      if (data.type === 'SYNC_ACTION' && data.action) {
        const incomingAction = data.action as StoreAction
        rawDispatch(incomingAction)

        // Generate in-app toast notification for remote action
        if (data.actor && data.actor !== stateRef.current.rangerName) {
          const actionSummary =
            incomingAction.type === 'ACKNOWLEDGE'
              ? `acknowledged ${('id' in incomingAction ? incomingAction.id : '')}`
              : incomingAction.type === 'CONTACT_RANGER'
                ? `contacted patrol for ${('id' in incomingAction ? incomingAction.id : '')}`
                : incomingAction.type === 'MONITOR'
                  ? `monitoring ${('id' in incomingAction ? incomingAction.id : '')}`
                  : incomingAction.type === 'RESOLVE'
                    ? `resolved ${('id' in incomingAction ? incomingAction.id : '')}`
                    : incomingAction.type === 'SEND_SMS'
                      ? 'sent community SMS warning'
                      : incomingAction.type === 'SEND_ALL_CLEAR'
                        ? 'sent all-clear notification'
                        : 'updated corridor event'

          rawDispatch({
            type: 'ADD_NOTIFICATION',
            notification: {
              id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              message: `${data.actor} ${actionSummary}`,
              timestamp: new Date().toISOString(),
              read: false,
              actor: data.actor,
              eventId: 'id' in incomingAction ? (incomingAction.id as string) : undefined,
            },
          })
        }
      }
    }

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [])

  // Auto-switch mode on auth state changes
  useEffect(() => {
    if (auth.isBooting) return
    const prev = prevAuthModeRef.current
    prevAuthModeRef.current = auth.mode
    if (auth.mode !== prev) rawDispatch({ type: 'SET_MODE', mode: auth.mode ?? 'user' })
  }, [auth.mode, auth.isBooting])

  // Sync user profile name on sign-in
  useEffect(() => {
    if (auth.mode === 'user' && auth.user?.name) {
      rawDispatch({ type: 'SET_RANGER_NAME', name: auth.user.name })
      void upsertProfile(auth.user.name, 'Central Corridor')
    }
  }, [auth.mode, auth.user?.name])

  // Load events, profiles & subscribers in user mode
  useEffect(() => {
    if (auth.isBooting || auth.mode !== 'user') return
    let cancelled = false

    Promise.all([loadEvents(), loadProfiles(), loadSubscribers()])
      .then(([events, profiles, subscribers]) => {
        if (cancelled) return
        rawDispatch({ type: 'HYDRATE_EVENTS', events, rangerName: auth.user?.name ?? '' })
        rawDispatch({ type: 'SET_PROFILES', profiles })
        rawDispatch({ type: 'SET_SUBSCRIBERS', subscribers })
        rawDispatch({ type: 'SET_PERSISTED', ok: true })
      })
      .catch((err) => {
        console.error('[GAHM Store] User mode initialization failed:', err)
        if (!cancelled) rawDispatch({ type: 'SET_PERSISTED', ok: false })
      })

    return () => {
      cancelled = true
    }
  }, [auth.mode, auth.isBooting, auth.user?.name])

  // Realtime subscription on Supabase `events` table (Unified Map for authenticated users)
  useEffect(() => {
    if (auth.isBooting || auth.mode !== 'user' || !supabase) return

    const channel = supabase
      .channel('public:events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            loadEvents().then((refreshed) => {
              rawDispatch({
                type: 'HYDRATE_EVENTS',
                events: refreshed,
                rangerName: auth.user?.name ?? '',
              })
              const actor = (payload.new as Record<string, unknown>).owner_name as string | undefined
              const eventId = (payload.new as Record<string, unknown>).event_id as string | undefined
              if (actor && actor !== stateRef.current.rangerName) {
                rawDispatch({
                  type: 'ADD_NOTIFICATION',
                  notification: {
                    id: `rt-${Date.now()}`,
                    message: `${actor} updated ${eventId || 'an event'} in the shared corridor`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    actor,
                    eventId,
                  },
                })
              }
            })
          }
        },
      )
      .subscribe()

    return () => {
      if (supabase) {
        void supabase.removeChannel(channel)
      }
    }
  }, [auth.mode, auth.isBooting, auth.user?.name])

  const dispatch = useCallback(
    (action: StoreAction) => {
      rawDispatch(action)
      const s = stateRef.current

      // In demo mode: broadcast action to other open tabs/windows
      if (s.mode === 'demo' && channelRef.current) {
        try {
          channelRef.current.postMessage({
            type: 'SYNC_ACTION',
            action,
            actor: s.rangerName || USER.name,
            timestamp: new Date().toISOString(),
          })
        } catch {
          // BroadcastChannel best effort
        }
      }

      // In user mode: write-through persist to Supabase
      if (s.mode !== 'user' || s.inTutorial) return
      const task = persistAction(action, s)
      if (!task) return
      task.then(
        () => rawDispatch({ type: 'SET_PERSISTED', ok: true }),
        () => rawDispatch({ type: 'SET_PERSISTED', ok: false }),
      )
    },
    [rawDispatch],
  )

  const kpis = useMemo(() => computeKpis(state.events), [state.events])
  const fullState = useMemo<StoreState>(
    () => ({ ...state, kpis }),
    [state, kpis],
  )
  const value = useMemo<StoreContextValue>(
    () => ({ state: fullState, dispatch }),
    [fullState, dispatch],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}