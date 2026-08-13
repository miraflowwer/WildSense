import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useGahm } from '../store/storeContext'
import { formatSpeciesName } from '../engine/config'
import { communities } from '../data/demoData'
import type { FilterState } from '../types'

const RISK_LEVELS: [string, string][] = [
  ['low', 'Low'],
  ['medium', 'Medium'],
  ['high', 'High'],
]

const STATUSES: [string, string][] = [
  ['awaiting_review', 'Awaiting review'],
  ['under_review', 'Under review'],
  ['monitoring', 'Monitoring'],
  ['escalated', 'Escalated'],
  ['dismissed', 'Dismissed'],
  ['resolved', 'Resolved'],
]

const selectCls =
  'min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs font-medium text-neutral-800 shadow-2xs transition-colors hover:border-neutral-400 focus:border-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-neutral-600">{text}</span>
      {children}
    </label>
  )
}

function FiltersBar() {
  const { state, dispatch } = useGahm()
  const { filter } = state

  const species = useMemo(
    () => Array.from(new Set(state.events.map((e) => e.species))).sort(),
    [state.events],
  )
  const zones = useMemo(
    () => Array.from(new Set(state.events.map((e) => e.sensor_zone))).sort(),
    [state.events],
  )

  const set = (patch: Partial<FilterState>) => dispatch({ type: 'SET_FILTER', patch })

  const activeCount = Object.values(filter).filter(Boolean).length

  return (
    <div className="border-b border-neutral-300 bg-neutral-100/90 px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Label text="Species">
          <select value={filter.species} onChange={(e) => set({ species: e.target.value })} className={selectCls}>
            <option value="">All species</option>
            {species.map((s) => (
              <option key={s} value={s}>
                {formatSpeciesName(s)}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Risk">
          <select value={filter.risk} onChange={(e) => set({ risk: e.target.value })} className={selectCls}>
            <option value="">All risk</option>
            {RISK_LEVELS.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Status">
          <select value={filter.status} onChange={(e) => set({ status: e.target.value })} className={selectCls}>
            <option value="">All statuses</option>
            {STATUSES.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Community">
          <select
            value={filter.community}
            onChange={(e) => set({ community: e.target.value })}
            className={selectCls}
          >
            <option value="">All communities</option>
            {communities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Zone">
          <select value={filter.zone} onChange={(e) => set({ zone: e.target.value })} className={selectCls}>
            <option value="">All zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Label>

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: 'SET_FILTER',
                patch: { species: '', risk: '', status: '', community: '', zone: '' },
              })
            }
            className="ml-auto text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Clear filters ({activeCount})
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default FiltersBar