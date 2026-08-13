import { useState } from 'react'
import { useGahm } from '../store/storeContext'
import type { DetectionEvent } from '../types'
import OutcomeForm from './OutcomeForm'

const STATUS_LABELS: Record<string, string> = {
  awaiting_review: 'Awaiting review',
  under_review: 'Under review',
  monitoring: 'Monitoring',
  escalated: 'Escalated',
  dismissed: 'Dismissed',
  resolved: 'Resolved',
}

const STATUS_PILL: Record<string, string> = {
  awaiting_review: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  monitoring: 'bg-sky-100 text-sky-800',
  escalated: 'bg-red-100 text-red-800',
  dismissed: 'bg-neutral-200 text-neutral-700',
  resolved: 'bg-emerald-100 text-emerald-800',
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function signed(points: number) {
  return points >= 0 ? `+${points}` : `−${Math.abs(points)}`
}

const btnCls =
  'rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40'

const btnPrimaryCls =
  'rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40'

function AlertPanel({ event }: { event: DetectionEvent }) {
  const { state, dispatch } = useGahm()
  const [falseNote, setFalseNote] = useState('')
  const [showOutcome, setShowOutcome] = useState(false)

  const settled = event.status === 'dismissed' || event.status === 'resolved'

  const riskText = event.risk_level === 'high' ? 'text-red-600' : event.risk_level === 'medium' ? 'text-amber-600' : 'text-emerald-600'
  const riskBox =
    event.risk_level === 'high'
      ? 'border-red-200 bg-red-50'
      : event.risk_level === 'medium'
        ? 'border-amber-200 bg-amber-50'
        : 'border-emerald-200 bg-emerald-50'

  const suggested =
    event.risk_level === 'high'
      ? 'Contact the nearest ranger unit and prepare a community SMS warning.'
      : event.risk_level === 'medium'
        ? 'Dispatch a ranger patrol to verify and monitor the area.'
        : 'Log for monitoring; no immediate action is required.'

  const uncertainty =
    event.uncertainty && event.uncertainty.warning != null
      ? event.uncertainty.warning ||
        'Risk uncertain: recent movement data is unavailable. Manual review recommended.'
      : null

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-neutral-200 px-3 py-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SELECT_ALERT', id: '' })}
            className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ← Back to alerts
          </button>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_PILL[event.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
            {STATUS_LABELS[event.status] ?? event.status}
          </span>
          <span className="ml-auto font-mono text-xs text-neutral-500">{event.event_id}</span>
        </div>

        <div className="space-y-4 p-3">
          <div>
            <h2 className="text-lg font-bold capitalize text-neutral-900">{event.species}</h2>
            <p className="text-xs text-neutral-500">
              {fmtTime(event.timestamp)} · {event.sensor_zone} · {event.estimated_count} animal
              {event.estimated_count === 1 ? '' : 's'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-neutral-200 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Detection confidence
              </div>
              <div className="mt-1 text-2xl font-bold text-neutral-900">
                {Math.round(event.detection_confidence * 100)}%
              </div>
            </div>
            <div className={`rounded-lg border p-3 ${riskBox}`}>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Conflict risk
              </div>
              <div className={`mt-1 text-2xl font-bold ${riskText}`}>
                {event.risk_score}
                <span className="text-sm font-medium text-neutral-400">/100</span>
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                {event.risk_level}
              </div>
            </div>
          </div>

          <section>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-neutral-500">
              Contributing signals
            </h3>
            <ul className="space-y-1.5">
              {event.reasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span
                    className={`w-9 shrink-0 font-mono font-bold ${r.points >= 0 ? 'text-red-600' : 'text-emerald-600'}`}
                  >
                    {signed(r.points)}
                  </span>
                  <span className="text-neutral-700">
                    <span className="font-semibold text-neutral-800">{r.label}</span> — {r.description}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-1.5 text-xs text-neutral-700">
            <div>
              <span className="font-semibold">Distance from community:</span>{' '}
              {event.distance_to_farm_km.toFixed(1)} km
            </div>
            <div>
              <span className="font-semibold">Movement:</span>{' '}
              {event.movement_toward_farm ? 'Toward farm boundary' : 'Away / other'}
              {event.speed_kmh != null ? ` at ${event.speed_kmh.toFixed(1)} km/h` : ''}
              {!event.movementKnown ? (
                <span className="ml-1 text-amber-700">
                  — no recent movement data, direction relies on the last detection.
                </span>
              ) : null}
            </div>
            <div>
              <span className="font-semibold">History:</span> {event.historical_incidents_nearby} past
              incident{event.historical_incidents_nearby === 1 ? '' : 's'} in this area
            </div>
            <div>
              <span className="font-semibold">Weather:</span>{' '}
              <span className="capitalize">{event.weather_condition}</span>
            </div>
          </section>

          {uncertainty ? (
            <div className="rounded-md border-l-4 border-amber-500 bg-[repeating-linear-gradient(45deg,#fef3c7,#fef3c7_10px,#fde68a_10px,#fde68a_20px)] p-3 text-xs text-amber-900">
              {uncertainty}
            </div>
          ) : null}

          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <h3 className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Suggested next action
            </h3>
            {suggested}
          </section>

          <p className="text-[11px] leading-relaxed text-neutral-500">
            Detection confidence measures how sure the model is that{' '}
            <span className="capitalize">{event.species}</span> was identified correctly. Conflict risk
            measures how likely this event is to need attention given the surrounding context. They are
            separate numbers.
          </p>

          {event.status === 'under_review' ? (
            <p className="text-[11px] text-neutral-500">
              Owner: {event.owner || state.rangerName} — tracking response time
            </p>
          ) : null}

          {event.rangerContactedAt ? (
            <p className="text-[11px] text-neutral-500">
              Ranger unit contacted — {event.owner || state.rangerName} dispatched at{' '}
              {fmtTime(event.rangerContactedAt)}.
            </p>
          ) : null}

          {settled ? (
            <div className="rounded-md bg-neutral-100 p-3 text-xs text-neutral-600">
              <p className="font-semibold text-neutral-700">
                {event.status === 'resolved' ? 'Incident resolved' : 'Incident dismissed'}
              </p>
              {event.outcome ? (
                <p className="mt-1">
                  Feedback: {event.outcome.feedback} · {event.outcome.responseMinutes} min response
                  {event.outcome.notes ? ` · "${event.outcome.notes}"` : ''}
                </p>
              ) : (
                <p className="mt-1">No outcome recorded.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={event.status !== 'awaiting_review'}
                  onClick={() => dispatch({ type: 'ACKNOWLEDGE', id: event.event_id })}
                  className={btnCls}
                >
                  Acknowledge
                </button>
                <button
                  type="button"
                  disabled={event.status === 'monitoring'}
                  onClick={() => dispatch({ type: 'MONITOR', id: event.event_id })}
                  className={btnCls}
                >
                  Monitor
                </button>
                <button
                  type="button"
                  disabled={event.rangerContactedAt != null || event.risk_score < 40}
                  onClick={() => dispatch({ type: 'CONTACT_RANGER', id: event.event_id })}
                  className={btnCls}
                >
                  Contact ranger unit
                </button>
                <button
                  type="button"
                  disabled={event.status === 'escalated'}
                  onClick={() => dispatch({ type: 'ESCALATE', id: event.event_id })}
                  className={btnCls}
                >
                  Escalate
                </button>
                <button
                  type="button"
                  disabled={event.risk_score < 40}
                  onClick={() => dispatch({ type: 'OPEN_SMS', id: event.event_id })}
                  className={`${btnCls} col-span-2`}
                >
                  Prepare community warning
                </button>
              </div>

              <div className="rounded-md border border-neutral-200 p-2">
                <textarea
                  value={falseNote}
                  onChange={(e) => setFalseNote(e.target.value)}
                  rows={2}
                  placeholder="Note (optional) — why this is low concern"
                  className="w-full rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'MARK_FALSE', id: event.event_id, note: falseNote })
                    setFalseNote('')
                  }}
                  className={`${btnCls} mt-1.5 w-full`}
                >
                  Mark as false / low concern
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowOutcome(true)}
                className={`${btnPrimaryCls} w-full`}
              >
                Close &amp; record outcome
              </button>
            </div>
          )}
        </div>
      </div>

      {showOutcome ? <OutcomeForm event={event} onClose={() => setShowOutcome(false)} /> : null}
    </>
  )
}

export default AlertPanel