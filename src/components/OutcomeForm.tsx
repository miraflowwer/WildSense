import { useEffect, useState } from 'react'
import { useGahm } from '../store/storeContext'
import { useI18n } from '../i18n/I18nContext'
import type { TKey } from '../i18n/catalog-en'
import type { DetectionEvent } from '../types'

const ACTIONS = ['None', 'Ranger patrol', 'SMS warning', 'Both', 'Escalated'] as const

function actionLabel(t: (k: TKey, p?: Record<string, string | number>) => string, a: string): string {
  switch (a) {
    case 'None':
      return t('outcome.actionNone')
    case 'Ranger patrol':
      return t('outcome.actionPatrol')
    case 'SMS warning':
      return t('outcome.actionSms')
    case 'Both':
      return t('outcome.actionBoth')
    case 'Escalated':
      return t('outcome.actionEscalated')
    default:
      return a
  }
}

const inputCls =
  'w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

function OutcomeForm({ event, onClose }: { event: DetectionEvent; onClose: () => void }) {
  const { dispatch } = useGahm()
  const { t } = useI18n()
  const [confirmed, setConfirmed] = useState(event.outcome?.confirmed ?? false)
  const [conflict, setConflict] = useState<'prevented' | 'occurred'>(
    event.outcome ? (event.outcome.conflictPrevented ? 'prevented' : 'occurred') : 'prevented',
  )
  const [actionTaken, setActionTaken] = useState<string>(event.outcome?.actionTaken ?? 'None')
  const [feedback, setFeedback] = useState<'valid' | 'false'>(event.outcome?.feedback ?? 'valid')
  const [responseMinutes, setResponseMinutes] = useState(
    event.outcome ? String(event.outcome.responseMinutes) : '',
  )
  const [notes, setNotes] = useState(event.outcome?.notes ?? '')

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const minutes = Number(responseMinutes)
  const valid = responseMinutes.trim() !== '' && Number.isFinite(minutes) && minutes >= 0

  const save = () => {
    dispatch({
      type: 'RESOLVE',
      id: event.event_id,
      outcome: {
        confirmed,
        conflictPrevented: conflict === 'prevented',
        actionTaken,
        feedback,
        responseMinutes: minutes,
        notes: notes.trim(),
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">{t('outcome.title')}</h3>
            <p className="font-mono text-xs text-neutral-500">{event.event_id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-md px-2 py-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            {t('outcome.confirmed')}
          </label>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-neutral-600">{t('outcome.conflict')}</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-sm text-neutral-800">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflict === 'prevented'}
                  onChange={() => setConflict('prevented')}
                  className="accent-emerald-600"
                />
                {t('outcome.prevented')}
              </label>
              <label className="flex items-center gap-1.5 text-sm text-neutral-800">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflict === 'occurred'}
                  onChange={() => setConflict('occurred')}
                  className="accent-emerald-600"
                />
                {t('outcome.occurred')}
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="outcome-action" className="mb-1 block text-xs font-semibold text-neutral-600">
              {t('outcome.actionTaken')}
            </label>
            <select
              id="outcome-action"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className={inputCls}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {actionLabel(t, a)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-neutral-600">{t('outcome.feedback')}</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-sm text-neutral-800">
                <input
                  type="radio"
                  name="feedback"
                  checked={feedback === 'valid'}
                  onChange={() => setFeedback('valid')}
                  className="accent-emerald-600"
                />
                {t('outcome.validAlert')}
              </label>
              <label className="flex items-center gap-1.5 text-sm text-neutral-800">
                <input
                  type="radio"
                  name="feedback"
                  checked={feedback === 'false'}
                  onChange={() => setFeedback('false')}
                  className="accent-emerald-600"
                />
                {t('outcome.falseAlert')}
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="outcome-minutes" className="mb-1 block text-xs font-semibold text-neutral-600">
              {t('outcome.responseMinutes')} <span className="text-red-500">*</span>
            </label>
            <input
              id="outcome-minutes"
              type="number"
              min={0}
              required
              value={responseMinutes}
              onChange={(e) => setResponseMinutes(e.target.value)}
              placeholder="e.g. 12"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="outcome-notes" className="mb-1 block text-xs font-semibold text-neutral-600">
              {t('outcome.notes')}
            </label>
            <textarea
              id="outcome-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t('outcome.notesPlaceholder')}
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!valid}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('outcome.saveOutcome')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OutcomeForm