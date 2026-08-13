import { useMemo } from 'react'
import { useGahm } from '../store/storeContext'

const ACTIVE_STATUSES = ['awaiting_review', 'under_review', 'monitoring', 'escalated']

function Stat({
  label,
  value,
  tone,
  accent,
  className,
}: {
  label: string
  value: string
  tone?: string
  accent?: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-neutral-400 hover:shadow-xs sm:px-3 sm:py-2 ${
        accent ?? 'border-l-4 border-l-neutral-400'
      } ${className ?? ''}`}
    >
      <div className="truncate text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className={`mt-0.5 text-base font-extrabold sm:text-lg ${tone ?? 'text-neutral-900'}`}>
        {value}
      </div>
    </div>
  )
}

function OperationsBar() {
  const { state } = useGahm()

  const highRisk = useMemo(
    () =>
      state.events.filter(
        (e) => e.risk_level === 'high' && ACTIVE_STATUSES.includes(e.status),
      ).length,
    [state.events],
  )

  const unreviewed = useMemo(
    () => state.events.filter((e) => e.status === 'awaiting_review').length,
    [state.events],
  )

  const avg = state.kpis.avgResponseMinutes

  return (
    <div
      data-tour="ops-bar"
      className="grid grid-cols-2 gap-1.5 border-b border-neutral-300 bg-neutral-100/90 px-3 py-2 sm:grid-cols-5 sm:gap-2.5 sm:px-4 sm:py-2.5"
    >
      <Stat
        label="Active high-risk incidents"
        value={String(highRisk)}
        tone={highRisk > 0 ? 'text-red-600' : 'text-neutral-700'}
        accent="border-l-4 border-l-red-500"
      />
      <Stat
        label="Unreviewed alerts"
        value={String(unreviewed)}
        tone={unreviewed > 0 ? 'text-amber-600' : 'text-neutral-700'}
        accent="border-l-4 border-l-amber-500"
      />
      <Stat
        label="Avg response time"
        value={avg === null || avg === undefined ? '— min' : `${avg} min`}
        tone="text-neutral-800"
        accent="border-l-4 border-l-sky-500"
      />
      <Stat
        label="Sensors online"
        value={`${state.kpis.sensorsOnline} / ${state.kpis.sensorsTotal}`}
        tone="text-emerald-700"
        accent="border-l-4 border-l-emerald-500"
      />
      <Stat
        label="Communities affected"
        value={String(state.kpis.communitiesAffected)}
        tone="text-purple-700"
        accent="border-l-4 border-l-purple-500"
        className="col-span-2 sm:col-span-1"
      />
    </div>
  )
}

export default OperationsBar