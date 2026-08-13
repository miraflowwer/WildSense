import { useState } from 'react'
import { useGahm } from '../store/storeContext'
import { useI18n } from '../i18n/I18nContext'
import {
  reasonDescription,
  reasonLabel,
  riskLevelLabel,
  speciesName,
  statusLabel,
  uncertaintyWarning,
  weatherName,
} from '../i18n/helpers'
import type { DetectionEvent } from '../types'
import OutcomeForm from './OutcomeForm'

const STATUS_PILL: Record<string, string> = {
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

function signed(points: number) {
  return points >= 0 ? `+${points}` : `−${Math.abs(points)}`
}

const btnCls =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-2xs transition-all hover:border-emerald-600 hover:bg-emerald-50/60 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-300 disabled:hover:bg-white'

const btnPrimaryCls =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40'

function AlertPanel({
  event,
  onOpenRiskExplanation,
}: {
  event: DetectionEvent
  onOpenRiskExplanation?: () => void
}) {
  const { state, dispatch } = useGahm()
  const { t, catalog, lang } = useI18n()
  const [falseNote, setFalseNote] = useState('')
  const [showOutcome, setShowOutcome] = useState(false)

  const settled = event.status === 'dismissed' || event.status === 'resolved'

  const riskText = event.risk_level === 'high' ? 'text-red-600' : event.risk_level === 'medium' ? 'text-amber-600' : 'text-blue-600'
  const riskBox =
    event.risk_level === 'high'
      ? 'border-red-300 bg-red-50/90'
      : event.risk_level === 'medium'
        ? 'border-amber-300 bg-amber-50/90'
        : 'border-blue-300 bg-blue-50/90'

  const suggested =
    event.risk_level === 'high'
      ? t('alertPanel.nextHigh')
      : event.risk_level === 'medium'
        ? t('alertPanel.nextMedium')
        : t('alertPanel.nextLow')

  const uncertainty = uncertaintyWarning(catalog, event.uncertainty?.warning ?? null)

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-neutral-300 bg-neutral-50 px-3 py-2.5">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SELECT_ALERT', id: '' })}
            className="inline-flex min-h-[36px] items-center rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            {t('alertPanel.backToAlerts')}
          </button>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_PILL[event.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
            {statusLabel(catalog, event.status)}
          </span>
          <span className="ml-auto font-mono text-xs font-semibold text-neutral-600">{event.event_id}</span>
        </div>

        <div className="space-y-3.5 p-3">
          <div>
            <h2 className="text-lg font-extrabold text-neutral-900">{speciesName(catalog, event.species)}</h2>
            <p className="text-xs text-neutral-500">
              {fmtTime(event.timestamp, lang)} · {event.sensor_zone} ·{' '}
              {t('common.animals', {
                count: event.estimated_count,
                plural: event.estimated_count === 1 ? '' : 's',
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-neutral-300 bg-white p-3 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {t('alertPanel.detectionConfidence')}
              </div>
              <div className="mt-1 text-2xl font-extrabold text-neutral-900">
                {Math.round(event.detection_confidence * 100)}%
              </div>
            </div>
            <div className={`rounded-lg border p-3 shadow-2xs ${riskBox}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                {t('alertPanel.conflictRisk')}
              </div>
              <div className={`mt-1 text-2xl font-extrabold ${riskText}`}>
                {event.risk_score}
                <span className="text-sm font-medium text-neutral-500">/100</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                {riskLevelLabel(catalog, event.risk_level)}
              </div>
            </div>
          </div>

          <section data-tour="contributing-signals" className="rounded-lg border border-neutral-300 bg-neutral-50/60 p-3 shadow-2xs">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-600">
                {t('alertPanel.contributingSignals')}
              </h3>
              {onOpenRiskExplanation ? (
                <button
                  type="button"
                  onClick={onOpenRiskExplanation}
                  className="text-[11px] font-bold text-emerald-700 underline hover:text-emerald-800"
                >
                  {t('alertPanel.howRiskCalc')}
                </button>
              ) : null}
            </div>
            <ul className="space-y-2">
              {event.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono font-extrabold ${
                      r.points >= 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {signed(r.points)}
                  </span>
                  <span className="text-neutral-800">
                    <span className="font-bold text-neutral-900">{reasonLabel(catalog, r)}</span> —{' '}
                    {reasonDescription(catalog, r, event)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-1.5 rounded-lg border border-neutral-300 bg-white p-3 text-xs text-neutral-700 shadow-2xs">
            <div>
              <span className="font-bold text-neutral-900">{t('alertPanel.distanceFromCommunity')}</span>{' '}
              {event.distance_to_farm_km.toFixed(1)} km
            </div>
            <div>
              <span className="font-bold text-neutral-900">{t('alertPanel.movement')}</span>{' '}
              {event.movement_toward_farm ? t('alertPanel.towardFarm') : t('alertPanel.awayOther')}
              {event.speed_kmh != null ? ` at ${event.speed_kmh.toFixed(1)} km/h` : ''}
              {!event.movementKnown ? (
                <span className="ml-1 font-medium text-amber-700">
                  {t('alertPanel.noRecentMovement')}
                </span>
              ) : null}
            </div>
            <div>
              <span className="font-bold text-neutral-900">{t('alertPanel.history')}</span>{' '}
              {t('alertPanel.pastIncidents', {
                n: event.historical_incidents_nearby,
                plural: event.historical_incidents_nearby === 1 ? '' : 's',
              })}
            </div>
            <div>
              <span className="font-bold text-neutral-900">{t('alertPanel.weather')}</span>{' '}
              <span>{weatherName(catalog, event.weather_condition)}</span>
            </div>
          </section>

          {uncertainty ? (
            <div data-tour="uncertainty-warning" className="rounded-lg border-l-4 border-amber-500 bg-[repeating-linear-gradient(45deg,#fef3c7,#fef3c7_10px,#fde68a_10px,#fde68a_20px)] p-3 text-xs font-medium text-amber-950 shadow-2xs">
              {uncertainty}
            </div>
          ) : null}

          <section className="rounded-lg border border-emerald-300 bg-emerald-50/90 p-3 text-xs text-emerald-950 shadow-2xs">
            <h3 className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              {t('alertPanel.suggestedNextAction')}
            </h3>
            {suggested}
          </section>

          <p className="text-[11px] leading-relaxed text-neutral-500">
            {t('alertPanel.confExplain', { species: speciesName(catalog, event.species) })}
          </p>

          {event.status === 'under_review' ? (
            <p className="text-[11px] font-semibold text-neutral-600">
              {t('alertPanel.ownerLine', { owner: event.owner || state.rangerName })}
            </p>
          ) : null}

          {event.rangerContactedAt ? (
            <p className="text-[11px] font-semibold text-neutral-600">
              {t('alertPanel.rangerContacted', {
                owner: event.owner || state.rangerName,
                time: fmtTime(event.rangerContactedAt, lang),
              })}
            </p>
          ) : null}

          {settled ? (
            <div className="rounded-lg border border-neutral-300 bg-neutral-100 p-3 text-xs text-neutral-700 shadow-2xs">
              <p className="font-bold text-neutral-900">
                {event.status === 'resolved' ? t('alertPanel.incidentResolved') : t('alertPanel.incidentDismissed')}
              </p>
              {event.outcome ? (
                <p className="mt-1">
                  {t('alertPanel.feedbackLine', {
                    feedback: event.outcome.feedback,
                    minutes: event.outcome.responseMinutes,
                    notes: event.outcome.notes ? ` · "${event.outcome.notes}"` : '',
                  })}
                </p>
              ) : (
                <p className="mt-1">{t('alertPanel.noOutcome')}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  data-tour="btn-acknowledge"
                  disabled={event.status !== 'awaiting_review'}
                  onClick={() => dispatch({ type: 'ACKNOWLEDGE', id: event.event_id })}
                  className={btnCls}
                >
                  {t('alertPanel.acknowledge')}
                </button>
                <button
                  type="button"
                  disabled={event.status === 'monitoring'}
                  onClick={() => dispatch({ type: 'MONITOR', id: event.event_id })}
                  className={btnCls}
                >
                  {t('alertPanel.monitor')}
                </button>
                <button
                  type="button"
                  data-tour="btn-contact-ranger"
                  disabled={event.rangerContactedAt != null || event.risk_score < 40}
                  onClick={() => dispatch({ type: 'CONTACT_RANGER', id: event.event_id })}
                  className={btnCls}
                >
                  {t('alertPanel.contactRanger')}
                </button>
                <button
                  type="button"
                  disabled={event.status === 'escalated'}
                  onClick={() => dispatch({ type: 'ESCALATE', id: event.event_id })}
                  className={btnCls}
                >
                  {t('alertPanel.escalate')}
                </button>
                <button
                  type="button"
                  data-tour="btn-prepare-sms"
                  disabled={event.risk_score < 40}
                  onClick={() => dispatch({ type: 'OPEN_SMS', id: event.event_id })}
                  className={`${btnCls} col-span-2`}
                >
                  {t('alertPanel.prepareSms')}
                </button>
              </div>

              <div className="rounded-lg border border-neutral-300 bg-white p-2.5 shadow-2xs">
                <textarea
                  value={falseNote}
                  onChange={(e) => setFalseNote(e.target.value)}
                  rows={2}
                  placeholder={t('alertPanel.falseNotePlaceholder')}
                  className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'MARK_FALSE', id: event.event_id, note: falseNote })
                    setFalseNote('')
                  }}
                  className={`${btnCls} mt-2 w-full`}
                >
                  {t('alertPanel.markFalse')}
                </button>
              </div>

              <button
                type="button"
                data-tour="btn-close-record"
                onClick={() => setShowOutcome(true)}
                className={`${btnPrimaryCls} w-full`}
              >
                {t('alertPanel.closeRecord')}
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