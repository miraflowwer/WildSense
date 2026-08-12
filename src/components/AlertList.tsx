import { useMemo } from 'react'
import { useGahm } from '../store/store'
import { filterEvents, sortedEvents } from '../store/selectors'

const STATUS_LABELS: Record<string, string> = {
  awaiting_review: 'Awaiting review',
  under_review: 'Under review',
  monitoring: 'Monitoring',
  escalated: 'Escalated',
  dismissed: 'Dismissed',
  resolved: 'Resolved',
}

const STATUS_COLORS: Record<string, string> = {
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

function AlertList() {
  const { state, dispatch } = useGahm()

  const events = useMemo(
    () => filterEvents(sortedEvents(state.events), state.filter),
    [state.events, state.filter],
  )

  if (events.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-sm text-neutral-500">
        {state.events.length === 0
          ? 'No detections yet. Log a detection from the map to start your workspace.'
          : 'No events match your filters.'}
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="divide-y divide-neutral-100">
        {events.map((e) => {
          const selected = e.event_id === state.selectedId
          const riskBg =
            e.risk_level === 'high'
              ? 'bg-red-500'
              : e.risk_level === 'medium'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
          return (
            <button
              key={e.event_id}
              type="button"
              onClick={() => dispatch({ type: 'SELECT_ALERT', id: e.event_id })}
              className={`block w-full border-l-2 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                selected ? 'border-l-emerald-600 bg-emerald-50' : 'border-l-transparent hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${riskBg}`}>
                  {e.risk_level.toUpperCase()} {e.risk_score}
                </span>
                <span className="font-mono text-[11px] text-neutral-500">{e.event_id}</span>
              </div>
              <div className="mt-1 text-sm font-semibold capitalize text-neutral-900">
                {e.species} <span className="font-normal text-neutral-500">×{e.estimated_count}</span>
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                {e.sensor_zone} · {e.distance_to_farm_km.toFixed(1)} km · {fmtTime(e.timestamp)}
              </div>
              <div className="mt-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    STATUS_COLORS[e.status] ?? 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {STATUS_LABELS[e.status] ?? e.status}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AlertList