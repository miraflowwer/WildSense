import { useEffect } from 'react'

interface EthicsModalProps {
  onClose: () => void
}

export default function EthicsModal({ onClose }: EthicsModalProps) {
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between border-b border-neutral-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Ethics &amp; Legal Compliance</h2>
            <p className="text-xs text-neutral-500">
              Responsible AI Principles &amp; Indian Legal Framework (SDG 15)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-xs text-neutral-700">
          <section className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
            <h3 className="mb-1 font-bold text-emerald-900">
              Wildlife (Protection) Act, 1972 (India)
            </h3>
            <p className="leading-relaxed text-emerald-800">
              Prioritizes non-lethal mitigation. Schedule I species (Asian Elephants, Bengal Tigers,
              Indian Leopards, Sloth Bears) automatically receive weighted risk-impact scores. Exact
              wildlife GPS coordinates are never included in public SMS warnings to prevent poachers or
              retaliatory hunting from exploiting the alert channel.
            </p>
          </section>

          <section className="rounded-lg border border-sky-200 bg-sky-50/70 p-3">
            <h3 className="mb-1 font-bold text-sky-900">
              Digital Personal Data Protection (DPDP) Act, 2023
            </h3>
            <p className="leading-relaxed text-sky-800">
              Strict data minimization: no biometric data or individual location tracking. All personal data is
              collected with informed consent, and community members can opt out of SMS warnings at any
              time by replying <strong className="font-semibold text-sky-900">STOP</strong>.
            </p>
          </section>

          <section className="space-y-2 rounded-lg border border-neutral-200 p-3">
            <h3 className="font-bold text-neutral-900">Responsible AI Core Principles</h3>
            <ul className="space-y-1.5 leading-relaxed text-neutral-600">
              <li>
                <strong className="text-neutral-800">Human-in-the-Loop:</strong> No autonomous deterrents or automatic dispatches. The human ranger makes all final intervention decisions.
              </li>
              <li>
                <strong className="text-neutral-800">Honest Uncertainty:</strong> The risk engine explicitly penalizes missing data (-8 pts) or low detection confidence (-5 pts) rather than making overconfident black-box assumptions.
              </li>
              <li>
                <strong className="text-neutral-800">Anti-Economic Bias:</strong> Smallholder farms are prioritized identically to large commercial operations—financial value and farm size are deliberately ignored.
              </li>
              <li>
                <strong className="text-neutral-800">Transparent Risk Engine:</strong> 0–100 score built from clear, explainable signals (+25 proximity, +20 movement, +15 species, +15 history, +10 time, +10 group, +5 weather).
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-5 border-t border-neutral-100 pt-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
