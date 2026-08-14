import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { subscribeVillager } from '../auth/api'
import { communities } from '../data/demoData'
import logoImg from '../img/logo.png'

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenEthics: () => void
  initialCommunity?: string
}

export default function SubscribeModal({
  isOpen,
  onClose,
  onOpenEthics,
  initialCommunity = 'Hangala',
}: SubscribeModalProps) {
  const [subName, setSubName] = useState('')
  const [subPhone, setSubPhone] = useState('')
  const [subCommunity, setSubCommunity] = useState(initialCommunity)
  const [subConsent, setSubConsent] = useState(false)
  const [subStatus, setSubStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [subError, setSubError] = useState('')

  useEffect(() => {
    if (initialCommunity) {
      setSubCommunity(initialCommunity)
    }
  }, [initialCommunity])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!subName.trim() || !subPhone.trim() || !subConsent) return
    setSubStatus('submitting')
    setSubError('')
    try {
      const res = await subscribeVillager({
        name: subName,
        phone: subPhone,
        community: subCommunity,
      })
      if (res.ok) {
        setSubStatus('success')
        setSubName('')
        setSubPhone('')
        setSubConsent(false)
      } else {
        setSubStatus('error')
        setSubError(res.error || 'Subscription failed. Please check your details.')
      }
    } catch {
      setSubStatus('error')
      setSubError('Failed to connect to subscription service.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscribe-modal-title"
    >
      <div
        data-lenis-prevent
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-emerald-200 bg-[#FDFBF7] p-6 sm:p-8 shadow-2xl space-y-5"
      >
        {/* Header Lockup */}
        <div className="flex items-start justify-between border-b border-[#E8E2D5] pb-4">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="WildSense Logo"
              className="h-10 w-10 object-contain rounded-xl shadow-2xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 id="subscribe-modal-title" className="text-lg sm:text-xl font-bold text-[#123524] leading-tight">
                  Community SMS Warnings
                </h2>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900">
                  DPDP §6
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                Direct mobile early warnings before animals approach agricultural boundaries.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            ✕
          </button>
        </div>

        {subStatus === 'success' ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-100/90 p-5 text-emerald-950 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                ✓
              </span>
              <span>Successfully Registered for Early Warnings!</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-900">
              Your mobile number is active for <strong>{subCommunity}</strong> community alerts.
              Exact animal GPS coordinates are quarantined for species protection. You can opt out anytime by replying <strong>STOP</strong>.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubStatus('idle')}
                className="rounded-xl border border-emerald-700/40 bg-white px-4 py-2 text-xs font-bold text-emerald-950 shadow-2xs hover:bg-emerald-50 transition-colors"
              >
                Register Another Number
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="modal-sub-name"
                  className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="modal-sub-name"
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Ramesh Gowda"
                  className="w-full rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30"
                />
              </div>

              <div>
                <label
                  htmlFor="modal-sub-phone"
                  className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1"
                >
                  Mobile Number
                </label>
                <input
                  id="modal-sub-phone"
                  type="tel"
                  required
                  value={subPhone}
                  onChange={(e) => setSubPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="modal-sub-comm"
                className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1"
              >
                Corridor Settlement
              </label>
              <select
                id="modal-sub-comm"
                value={subCommunity}
                onChange={(e) => setSubCommunity(e.target.value)}
                className="w-full rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 focus:border-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.preferredLanguage})
                  </option>
                ))}
              </select>
            </div>

            {/* DPDP Section 6 Consent Checkbox */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3.5">
              <label className="flex items-start gap-3 text-xs leading-relaxed text-emerald-950 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={subConsent}
                  onChange={(e) => setSubConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-emerald-700 focus:ring-2 focus:ring-emerald-500/40"
                />
                <span>
                  <strong>Consent under DPDP Act 2023 (§6):</strong> I consent to receive wildlife early warning SMS alerts from the corridor patrol. I understand animal coordinates are scrubbed for species protection, and I can reply <strong>STOP</strong> at any time to opt out. (
                  <button
                    type="button"
                    onClick={onOpenEthics}
                    className="font-bold underline hover:text-emerald-800"
                  >
                    Read Ethics Charter
                  </button>
                  )
                </span>
              </label>
            </div>

            {subError && (
              <div className="rounded-xl bg-red-100 p-2.5 text-xs font-medium text-red-800">
                {subError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-neutral-500">
                🔒 Zero commercial sharing · Instant STOP opt-out
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto rounded-xl border border-[#E8E2D5] bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subStatus === 'submitting' || !subConsent}
                  className="w-1/2 sm:w-auto rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 transition-colors disabled:opacity-50"
                >
                  {subStatus === 'submitting' ? 'Registering…' : 'Subscribe to Warnings'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
