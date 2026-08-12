import { useMemo } from 'react'
import { useGahm } from '../store/store'

const ACTIVE_STATUSES = ['awaiting_review', 'under_review', 'monitoring', 'escalated']

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
      <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className={`mt-0.5 text-lg font-bold ${tone ?? 'text-neutral-900'}`}>{value}</div>
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
    <div className="grid grid-cols-2 gap-2 border-b border-neutral-200 bg-neutral-100 px-4 py-2.5 sm:grid-cols-5">
      <Stat
        label="Active high-risk incidents"
        value={String(highRisk)}
        tone={highRisk > 0 ? 'text-red-600' : undefined}
      />
      <Stat
        label="Unreviewed alerts"
        value={String(unreviewed)}
        tone={unreviewed > 0 ? 'text-amber-600' : undefined}
      />
      <Stat
        label="Avg response time"
        value={avg === null || avg === undefined ? '— min' : `${avg} min`}
      />
      <Stat
        label="Sensors online"
        value={`${state.kpis.sensorsOnline} / ${state.kpis.sensorsTotal}`}
      />
      <Stat label="Communities affected" value={String(state.kpis.communitiesAffected)} />
    </div>
  )
}

export default OperationsBar