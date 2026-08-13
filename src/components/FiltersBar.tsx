import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useGahm } from '../store/storeContext'
import { useI18n } from '../i18n/I18nContext'
import { riskLevelLabel, speciesName, statusLabel } from '../i18n/helpers'
import { communities } from '../data/demoData'
import type { FilterState } from '../types'

const RISK_LEVELS = ['low', 'medium', 'high']

const STATUSES = [
  'awaiting_review',
  'under_review',
  'monitoring',
  'escalated',
  'dismissed',
  'resolved',
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
  const { t, catalog } = useI18n()
  const { filter, filtersExpanded } = state

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
  const isExpanded = filtersExpanded || activeCount > 0

  return (
    <div className="border-b border-neutral-300 bg-neutral-100/90 text-xs">
      {/* Toggle header bar */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_FILTERS' })}
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-1.5 font-bold text-neutral-700 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded px-1"
        >
          <span>🔍 {t('filters.title')}</span>
          {activeCount > 0 ? (
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
          <span className="text-[10px] text-neutral-400">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: 'SET_FILTER',
                patch: { species: '', risk: '', status: '', community: '', zone: '' },
              })
            }
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            {t('filters.clearFilters', { n: activeCount })}
          </button>
        ) : null}
      </div>

      {/* Expanded controls */}
      {isExpanded ? (
        <div className="border-t border-neutral-200 px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Label text={t('filters.species')}>
              <select value={filter.species} onChange={(e) => set({ species: e.target.value })} className={selectCls}>
                <option value="">{t('filters.allSpecies')}</option>
                {species.map((s) => (
                  <option key={s} value={s}>
                    {speciesName(catalog, s)}
                  </option>
                ))}
              </select>
            </Label>
            <Label text={t('filters.risk')}>
              <select value={filter.risk} onChange={(e) => set({ risk: e.target.value })} className={selectCls}>
                <option value="">{t('filters.allRisk')}</option>
                {RISK_LEVELS.map((v) => (
                  <option key={v} value={v}>
                    {riskLevelLabel(catalog, v)}
                  </option>
                ))}
              </select>
            </Label>
            <Label text={t('filters.status')}>
              <select value={filter.status} onChange={(e) => set({ status: e.target.value })} className={selectCls}>
                <option value="">{t('filters.allStatuses')}</option>
                {STATUSES.map((v) => (
                  <option key={v} value={v}>
                    {statusLabel(catalog, v)}
                  </option>
                ))}
              </select>
            </Label>
            <Label text={t('filters.community')}>
              <select
                value={filter.community}
                onChange={(e) => set({ community: e.target.value })}
                className={selectCls}
              >
                <option value="">{t('filters.allCommunities')}</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Label>
            <Label text={t('filters.zone')}>
              <select value={filter.zone} onChange={(e) => set({ zone: e.target.value })} className={selectCls}>
                <option value="">{t('filters.allZones')}</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </Label>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default FiltersBar