import { useEffect, useState } from 'react'
import { useGahm } from '../store/storeContext'
import { findById } from '../store/selectors'
import { insertSmsLog } from '../auth/api'
import { useI18n } from '../i18n/I18nContext'
import { LOCALE_IDS } from '../i18n'
import { communities } from '../data/demoData'
import logoImg from '../img/logo.png'

type SmsLang = 'en' | 'hi' | 'kn' | 'ta'

function langForCommunity(community: string | undefined): SmsLang {
  const comm = communities.find((c) => c.name === community)
  switch (comm?.preferredLanguage) {
    case 'Kannada':
      return 'kn'
    case 'Tamil':
      return 'ta'
    case 'Hindi':
      return 'hi'
    default:
      return 'en'
  }
}

function messageFor(lang: SmsLang, zone: string): string {
  switch (lang) {
    case 'hi':
      return `WildSense चेतावनी: ${zone} के पास वन्यजीव ख़तरा। पशुओं को सुरक्षित करें और खेत की सीमा से दूर रहें। वनरक्षकों को सूचित कर दिया गया है। सुरक्षित होने पर SAFE जवाब दें। रद्द करने के लिए STOP लिखें।`
    case 'kn':
      return `WildSense ಎಚ್ಚರಿಕೆ: ${zone} ಬಳಿ ವನ್ಯಜೀವಿ ಅಪಾಯ. ಜಾನುವಾರುಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಿ ಮತ್ತು ಹೊಲದ ಗಡಿಯಿಂದ ದೂರವಿರಿ. ರೇಂಜರ್ಗಳಿಗೆ ಸೂಚಿಸಲಾಗಿದೆ. ಸುರಕ್ಷಿತವಾದಾಗ SAFE ಎಂದು ಉತ್ತರಿಸಿ. ನಿರ್ಗಮನಕ್ಕೆ STOP ಬರೆಯಿರಿ.`
    case 'ta':
      return `WildSense எச்சரிக்கை: ${zone} அருகே வனவிலங்கு ஆபத்து. கால்நடைகளை பாதுகாப்பாக வைத்து, வயல் எல்லையைத் தவிர்க்கவும். வனக்காவலர்களுக்கு தெரிவிக்கப்பட்டது. பாதுகாப்பாக இருந்தால் SAFE என்று பதிலளிக்கவும். விலகுவதற்கு STOP அனுப்பவும்.`
    default:
      return `WildSense ALERT: High wildlife risk near ${zone}. Secure livestock and avoid the farm boundary. Rangers have been notified. Reply SAFE when secure. Reply STOP to opt out.`
  }
}

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

function fmtAt(iso: string, locale: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

function SmsSimulator() {
  const { state, dispatch } = useGahm()
  const { t, lang } = useI18n()
  const event = state.sms.openEventId ? findById(state.events, state.sms.openEventId) : undefined
  const [smsLang, setSmsLang] = useState<SmsLang>(() => langForCommunity(event?.community))
  const [reply, setReply] = useState('SAFE')

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') dispatch({ type: 'CLOSE_SMS' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  useEffect(() => {
    if (!event) return
    setSmsLang(langForCommunity(event.community))
  }, [event])

  if (!event) return null

  const message = messageFor(smsLang, event.sensor_zone)

  const sendWarning = () => {
    dispatch({ type: 'SEND_SMS' })
    if (state.mode === 'user' && !state.inTutorial && event) {
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
    if (state.mode === 'user' && !state.inTutorial && event) {
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
      <div data-tour="sms-modal" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="WildSense Logo" className="h-9 w-9 object-contain rounded-lg shadow-2xs shrink-0" />
            <div>
              <h3 className="text-base font-bold text-neutral-900 leading-tight">{t('sms.title')}</h3>
              <p className="text-xs text-neutral-500">
                {t('sms.zone', { zone: event.sensor_zone, id: event.event_id })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'CLOSE_SMS' })}
            aria-label={t('common.close')}
            className="rounded-md px-2 py-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ×
          </button>
        </div>

        <div className="mb-3">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">{t('sms.language')}</span>
            <span className="text-[10px] text-neutral-400">
              {t('sms.autoSelected', { community: event.community })}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setSmsLang('en')} className={langBtn(smsLang === 'en')}>
              English
            </button>
            <button type="button" onClick={() => setSmsLang('hi')} className={langBtn(smsLang === 'hi')}>
              हिन्दी
            </button>
            <button type="button" onClick={() => setSmsLang('kn')} className={langBtn(smsLang === 'kn')}>
              ಕನ್ನಡ
            </button>
            <button type="button" onClick={() => setSmsLang('ta')} className={langBtn(smsLang === 'ta')}>
              தமிழ்
            </button>
          </div>
        </div>

        <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            {t('sms.composedMessage')}
          </div>
          <p className="text-sm leading-relaxed text-neutral-800">{message}</p>
        </div>

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            <span>{t('sms.recipients')} ({event.community || t('common.all')})</span>
            {state.mode === 'user' ? (
              <span className="text-[10px] font-normal text-neutral-400">
                {t('sms.verifiedSubscribers')}
              </span>
            ) : null}
          </div>

          {state.mode === 'user' && state.subscribers.filter((s) => !event.community || s.community === event.community).length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50/70 p-3 text-center text-xs text-neutral-500">
              <p>{t('sms.noSubscribersInCommunity', { community: event.community || 'this area' })}</p>
              <p className="mt-1 text-[11px] text-neutral-400">
                {t('sms.subscribersSelfRegister')}
              </p>
            </div>
          ) : (
            <ul className="space-y-1 rounded-lg border border-neutral-200 p-2 max-h-36 overflow-y-auto">
              {(state.mode === 'user'
                ? state.subscribers.filter((s) => !event.community || s.community === event.community)
                : RECIPIENTS.map((r, i) => ({ id: `rec-${i}`, name: r.split(' — ')[1] || 'Resident', phone: r.split(' — ')[0] || r }))
              ).map((sub) => (
                <li key={sub.id} className="flex items-center justify-between text-xs text-neutral-700">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    <span className="font-mono text-neutral-500">{sub.phone}</span>
                    <span className="font-semibold text-neutral-900">— {sub.name}</span>
                  </div>
                  {state.mode === 'user' ? (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'REMOVE_SUBSCRIBER', id: sub.id })}
                      title={t('sms.removeSubscriber')}
                      className="ml-2 text-[11px] text-neutral-400 hover:text-red-600 focus-visible:outline-none"
                    >
                      ✕
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          data-tour="btn-send-sms"
          onClick={sendWarning}
          disabled={state.sms.sending}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.sms.sending ? t('sms.sending') : t('sms.sendWarning')}
        </button>

        {state.sms.sentAt ? (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-emerald-600">{t('sms.delivered', { n: state.sms.delivered })}</span>
            <span className="font-semibold text-red-600">{t('sms.failed', { n: state.sms.failed })}</span>
            <span className="text-neutral-400">{t('sms.sentAt', { time: fmtAt(state.sms.sentAt, LOCALE_IDS[lang]) })}</span>
          </div>
        ) : null}

        <div className="mt-4">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            {t('sms.replies')}
          </div>
          {state.sms.replies.length === 0 ? (
            <p className="text-xs text-neutral-400">{t('sms.noReplies')}</p>
          ) : (
            <ul className="space-y-1 rounded-lg border border-neutral-200 p-2">
              {state.sms.replies.map((r, i) => (
                <li key={i} className="text-xs">
                  <span className="font-semibold text-emerald-700">{r.text}</span>
                  <span className="ml-2 text-neutral-400">{fmtAt(r.at, LOCALE_IDS[lang])}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t('sms.replyPlaceholder')}
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
              {t('common.send')}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={sendAllClear}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            {t('sms.sendAllClear')}
          </button>
          {state.sms.allClearSent ? (
            <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
              {t('sms.allClearSent', { zone: event.sensor_zone })}
            </div>
          ) : null}
        </div>

        <p className="mt-4 border-t border-neutral-100 pt-2 text-[10px] text-neutral-400">
          {t('sms.compliance')}
        </p>
      </div>
    </div>
  )
}

export default SmsSimulator