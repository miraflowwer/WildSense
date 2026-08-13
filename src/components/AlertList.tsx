import { useMemo } from 'react'
import { useGahm } from '../store/storeContext'
import { useI18n } from '../i18n/I18nContext'
import { LOCALE_IDS } from '../i18n'
import { riskLevelLabel, speciesName, statusLabel } from '../i18n/helpers'
import { filterEvents, sortedEvents } from '../store/selectors'

const STATUS_COLORS: Record<string, string> = {
  awaiting_review: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  monitoring: 'bg-sky-100 text-sky-800',
  escalated: 'bg-red-100 text-red-800',
  dismissed: 'bg-neutral-200 text-neutral-700',
  resolved: 'bg-emerald-100 text-emerald-800',
}

function fmtTime(iso: string, locale: string) {
  const d = new Date(iso)
  return d.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AlertList() {
  const { state, dispatch } = useGahm()
  const { t, catalog, lang } = useI18n()

  const events = useMemo(
    () => filterEvents(sortedEvents(state.events), state.filter),
    [state.events, state.filter],
  )

  if (events.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-sm text-neutral-500">
        {state.events.length === 0
          ? t('alertList.emptyNoDetections')
          : t('alertList.emptyFiltered')}
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-2.5">
      <div className="space-y-2">
        {events.map((e) => {
          const selected = e.event_id === state.selectedId
          const riskBg =
            e.risk_level === 'high'
              ? 'bg-red-600 text-white'
              : e.risk_level === 'medium'
                ? 'bg-amber-600 text-white'
                : 'bg-blue-600 text-white'
          return (
            <button
              key={e.event_id}
              data-tour={`alert-${e.event_id}`}
              type="button"
              onClick={() => dispatch({ type: 'SELECT_ALERT', id: e.event_id })}
              className={`block w-full rounded-lg border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                selected
                  ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500/40'
                  : 'border-neutral-250 bg-white shadow-2xs hover:border-neutral-400 hover:bg-neutral-50/80 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold tracking-tight shadow-2xs ${riskBg}`}
                  >
                    {riskLevelLabel(catalog, e.risk_level).toUpperCase()} {e.risk_score}
                  </span>
                  <span className="font-mono text-xs font-semibold text-neutral-600">
                    {e.event_id}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    STATUS_COLORS[e.status] ?? 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {statusLabel(catalog, e.status)}
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between text-sm font-bold text-neutral-900">
                <span>
                  {speciesName(catalog, e.species)}{' '}
                  <span className="font-normal text-neutral-500">×{e.estimated_count}</span>
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500">
                <span>{e.sensor_zone}</span>
                <span>·</span>
                <span>{e.distance_to_farm_km.toFixed(1)} km</span>
                <span>·</span>
                <span>{fmtTime(e.timestamp, LOCALE_IDS[lang])}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AlertList