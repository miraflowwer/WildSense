import { useEffect, useState } from 'react'
import { useGahm } from '../store/storeContext'
import { findById } from '../store/selectors'
import { insertSmsLog } from '../auth/api'

const RECIPIENTS = [
  '+91 98450 10221 — R. Sharma',
  '+91 98450 10334 — S. Gowda',
  '+91 98450 10457 — A. Kumar',
  '+91 98450 10582 — P. Naik',
  '+91 98450 10603 — M. Hegde',
  '+91 98450 10776 — K. Rao',
]

const langBtn = (active: boolean) =>
  `rounded-md px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
    active
      ? 'bg-emerald-600 text-white'
      : 'border border-neutral-300 text-neutral-600 hover:bg-neutral-50'
  }`

function fmtAt(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function SmsSimulator() {
  const { state, dispatch } = useGahm()
  const event = state.sms.openEventId ? findById(state.events, state.sms.openEventId) : undefined
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const [reply, setReply] = useState('SAFE')

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') dispatch({ type: 'CLOSE_SMS' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  if (!event) return null

  const message =
    lang === 'en'
      ? `GAHM ALERT: High wildlife risk near ${event.sensor_zone}. Secure livestock and avoid the northern boundary. Rangers have been notified. Reply SAFE when secure.`
      : `GAHM चेतावनी: ${event.sensor_zone} के पास वन्यजीव ख़तरा। पशुओं को सुरक्षित करें और सीमा से दूर रहें। वनरक्षकों को सूचित कर दिया गया है। सुरक्षित होने पर SAFE जवाब दें।`

  const sendWarning = () => {
    dispatch({ type: 'SEND_SMS' })
    if (state.mode === 'user' && event) {
      insertSmsLog({
        eventId: event.event_id,
        message,
        delivered: 5,
        failed: 1,
        allClear: false,
      }).catch(() => dispatch({ type: 'SET_PERSISTED', ok: false }))
    }
  }

  const sendAllClear = () => {
    dispatch({ type: 'SEND_ALL_CLEAR' })
    if (state.mode === 'user' && event) {
      insertSmsLog({
        eventId: event.event_id,
        message,
        delivered: 0,
        failed: 0,
        allClear: true,
      }).catch(() => dispatch({ type: 'SET_PERSISTED', ok: false }))
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Simulated SMS warning — Demo</h3>
            <p className="text-xs text-neutral-500">
              Zone: {event.sensor_zone} · {event.event_id}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'CLOSE_SMS' })}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ×
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600">Language:</span>
          <button type="button" onClick={() => setLang('en')} className={langBtn(lang === 'en')}>
            English
          </button>
          <button type="button" onClick={() => setLang('hi')} className={langBtn(lang === 'hi')}>
            Hindi (हिन्दी)
          </button>
        </div>

        <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Composed message
          </div>
          <p className="text-sm leading-relaxed text-neutral-800">{message}</p>
        </div>

        <div className="mb-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Recipients (demo numbers)
          </div>
          <ul className="space-y-0.5 rounded-lg border border-neutral-200 p-2">
            {RECIPIENTS.map((r) => (
              <li key={r} className="flex items-center gap-1.5 text-xs text-neutral-700">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          data-tour="btn-send-sms"
          onClick={sendWarning}
          disabled={state.sms.sending}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.sms.sending ? 'Sending…' : 'Send warning'}
        </button>

        {state.sms.sentAt ? (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-emerald-600">delivered · {state.sms.delivered}</span>
            <span className="font-semibold text-red-600">delivery failed · {state.sms.failed}</span>
            <span className="text-neutral-400">Sent {fmtAt(state.sms.sentAt)}</span>
          </div>
        ) : null}

        <div className="mt-4">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Replies
          </div>
          {state.sms.replies.length === 0 ? (
            <p className="text-xs text-neutral-400">No replies yet.</p>
          ) : (
            <ul className="space-y-1 rounded-lg border border-neutral-200 p-2">
              {state.sms.replies.map((r, i) => (
                <li key={i} className="text-xs">
                  <span className="font-semibold text-emerald-700">{r.text}</span>
                  <span className="ml-2 text-neutral-400">{fmtAt(r.at)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="e.g. SAFE"
              className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            />
            <button
              type="button"
              onClick={() => {
                if (reply.trim()) {
                  dispatch({ type: 'SMS_REPLY', text: reply.trim() })
                  setReply('')
                }
              }}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              Send
            </button>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={sendAllClear}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            Send all-clear
          </button>
          {state.sms.allClearSent ? (
            <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
              All-clear sent: wildlife risk has cleared in {event.sensor_zone}. Thank you for securing
              your area.
            </div>
          ) : null}
        </div>

        <p className="mt-4 border-t border-neutral-100 pt-2 text-[10px] text-neutral-400">
          Coordinates are never shared with recipients. Recipients may opt out by replying STOP.
        </p>
      </div>
    </div>
  )
}

export default SmsSimulator