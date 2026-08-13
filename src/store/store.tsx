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
} from '../types'
import { buildDemoState, sensors, farmZones, USER } from '../data/demoData'
import { haversineKm } from '../engine/geo'
import { useAuth } from '../auth/authContext'
import { loadEvents, insertEvent, updateEvent } from '../auth/api'
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
  const demoEvents = buildDemoState()
  const events = mode === 'demo' ? demoEvents : []
  return {
    events,
    selectedId: null,
    filter: { species: '', risk: '', status: 'awaiting_review', zone: '', community: '' },
    sms: { ...EMPTY_SMS },
    kpis: computeKpis(events),
    rangerName: mode === 'demo' ? USER.name : '',
    lastSyncAt: new Date().toISOString(),
    mode,
    notPersisted: false,
  }
}

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SELECT_ALERT':
      return { ...state, selectedId: action.id }

    case 'SET_RANGER_NAME':
      return { ...state, rangerName: action.name.trim() || USER.name }

    case 'SET_SYNC':
      return { ...state, lastSyncAt: action.at }

    case 'CONTACT_RANGER':
      return {
        ...state,
        events: state.events.map((e) =>
          e.event_id === action.id
            ? {
                ...e,
                rangerContactedAt: e.rangerContactedAt ?? new Date().toISOString(),
                owner: e.owner ?? state.rangerName,
              }
            : e,
        ),
      }

    case 'ACKNOWLEDGE':
      return {
        ...state,
        events: state.events.map((e) =>
          e.event_id === action.id
            ? {
                ...e,
                status: 'under_review',
                owner: state.rangerName,
                acknowledgedAt: new Date().toISOString(),
              }
            : e,
        ),
      }

    case 'MONITOR':
      return {
        ...state,
        events: state.events.map((e) =>
          e.event_id === action.id
            ? { ...e, status: 'monitoring', owner: e.owner ?? state.rangerName }
            : e,
        ),
      }

    case 'ESCALATE':
      return {
        ...state,
        events: state.events.map((e) =>
          e.event_id === action.id ? { ...e, status: 'escalated' } : e,
        ),
      }

    case 'MARK_FALSE':
      return {
        ...state,
        events: state.events.map((e) =>
          e.event_id === action.id
            ? {
                ...e,
                status: 'dismissed',
                outcome: {
                  confirmed: false,
                  conflictPrevented: false,
                  actionTaken: 'None',
                  feedback: 'false',
                  responseMinutes: 0,
                  notes: action.note,
                },
              }
            : e,
        ),
      }

    case 'RESOLVE':
      return {
        ...state,
        events: state.events.map((e) =>
          e.event_id === action.id
            ? { ...e, status: 'resolved', outcome: action.outcome }
            : e,
        ),
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

    case 'SEND_SMS':
      return {
        ...state,
        sms: {
          ...state.sms,
          sending: true,
          sentAt: new Date().toISOString(),
          delivered: 5,
          failed: 1,
        },
      }

    case 'SMS_REPLY':
      return {
        ...state,
        sms: {
          ...state.sms,
          replies: [
            ...state.sms.replies,
            { text: action.text, at: new Date().toISOString() },
          ],
        },
      }

    case 'SEND_ALL_CLEAR':
      return { ...state, sms: { ...state.sms, allClearSent: true } }

    case 'SET_MODE':
      return initialState(action.mode)

    case 'HYDRATE_EVENTS':
      return {
        ...state,
        events: action.events,
        rangerName: action.rangerName.trim() || USER.name,
        lastSyncAt: new Date().toISOString(),
        notPersisted: false,
      }

    case 'ADD_EVENT':
      return {
        ...state,
        events: [action.event, ...state.events],
        selectedId: action.event.event_id,
      }

    case 'SET_PERSISTED':
      return { ...state, notPersisted: !action.ok }

    case 'RESET_DEMO':
      return initialState(state.mode)

    default:
      return state
  }
}

function persistAction(action: StoreAction, s: StoreState): Promise<void> | null {
  switch (action.type) {
    case 'ACKNOWLEDGE':
      return updateEvent(action.id, {
        status: 'under_review',
        acknowledged_at: new Date().toISOString(),
        owner_name: s.rangerName,
      })

    case 'CONTACT_RANGER': {
      const existing = s.events.find((e) => e.event_id === action.id)
      return updateEvent(action.id, {
        ranger_contacted_at: existing?.rangerContactedAt ?? new Date().toISOString(),
        owner_name: existing?.owner ?? s.rangerName,
      })
    }

    case 'MONITOR':
      return updateEvent(action.id, {
        status: 'monitoring',
        owner_name:
          s.events.find((e) => e.event_id === action.id)?.owner ?? s.rangerName,
      })

    case 'ESCALATE':
      return updateEvent(action.id, { status: 'escalated' })

    case 'MARK_FALSE':
      return updateEvent(action.id, {
        status: 'dismissed',
        outcome: {
          confirmed: false,
          conflictPrevented: false,
          actionTaken: 'None',
          feedback: 'false',
          responseMinutes: 0,
          notes: action.note,
        },
      })

    case 'RESOLVE':
      return updateEvent(action.id, { status: 'resolved', outcome: action.outcome })

    case 'ADD_EVENT':
      return insertEvent(action.event)

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

  useEffect(() => {
    if (auth.isBooting) return
    const prev = prevAuthModeRef.current
    prevAuthModeRef.current = auth.mode
    if (auth.mode !== prev) rawDispatch({ type: 'SET_MODE', mode: auth.mode ?? 'user' })
  }, [auth.mode, auth.isBooting])

  useEffect(() => {
    if (auth.isBooting || auth.mode !== 'user') return
    let cancelled = false
    loadEvents()
      .then((events) => {
        if (cancelled) return
        rawDispatch({ type: 'HYDRATE_EVENTS', events, rangerName: auth.user?.name ?? '' })
        rawDispatch({ type: 'SET_PERSISTED', ok: true })
      })
      .catch(() => {
        if (!cancelled) rawDispatch({ type: 'SET_PERSISTED', ok: false })
      })
    return () => {
      cancelled = true
    }
  }, [auth.mode, auth.isBooting, auth.user?.name])

  const dispatch = useCallback(
    (action: StoreAction) => {
      rawDispatch(action)
      const s = stateRef.current
      if (s.mode !== 'user') return
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