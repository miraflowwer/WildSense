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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div data-lenis-prevent className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Ethics &amp; Legal Compliance Charter</h2>
            <p className="text-xs text-neutral-500">
              Responsible AI Principles &amp; Statutory Indian Legal Framework
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2.5 py-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-neutral-700">
          <section className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-emerald-950 text-sm">
                Wild Life (Protection) Act, 1972 (§9 &amp; Schedule I)
              </h3>
              <a
                href="https://www.indiacode.nic.in/handle/123456789/1726"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-emerald-700 underline hover:text-emerald-800"
              >
                Official Act ↗
              </a>
            </div>
            <blockquote className="border-l-2 border-emerald-500 pl-2.5 italic text-emerald-900 leading-relaxed text-[11px]">
              &ldquo;No person shall hunt any wild animal specified in Schedules I, II, III and IV except as provided under section 11 and section 12.&rdquo;
            </blockquote>
            <p className="leading-relaxed text-emerald-800">
              Schedule I species (Asian Elephants, Bengal Tigers, Indian Leopards, Sloth Bears) receive highest-tier weighted risk modeling. To protect animals against poaching and retaliatory tracking, exact GPS coordinates are strictly quarantined to verified rangers and scrubbed from all public warnings.
            </p>
          </section>

          <section className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sky-950 text-sm">
                Digital Personal Data Protection Act, 2023 (§6 Consent)
              </h3>
              <a
                href="https://www.meity.gov.in/content/digital-personal-data-protection-act-2023"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-sky-700 underline hover:text-sky-800"
              >
                MeitY Gazette ↗
              </a>
            </div>
            <blockquote className="border-l-2 border-sky-500 pl-2.5 italic text-sky-900 leading-relaxed text-[11px]">
              &ldquo;The consent given by the Data Principal shall be free, specific, informed, unconditional and unambiguous with a clear affirmative action, and shall signify an agreement to the processing of her personal data for the specified purpose...&rdquo;
            </blockquote>
            <p className="leading-relaxed text-sky-800">
              Strict data minimization: zero biometric tracking or personal location monitoring. Villager warning subscriptions require explicit consent under DPDP §6, with an instant opt-out mechanism by replying <strong className="font-semibold text-sky-950">STOP</strong>.
            </p>
          </section>

          <section className="space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
            <h3 className="font-bold text-neutral-900 text-sm">Responsible AI Core Safeguards</h3>
            <ul className="space-y-2 leading-relaxed text-neutral-600">
              <li>
                <strong className="text-neutral-900">1. Human-in-the-Loop:</strong> Sole decision-making authority remains with the forest ranger. WildSense never triggers autonomous acoustic or physical deterrents.
              </li>
              <li>
                <strong className="text-neutral-900">2. Honest Uncertainty:</strong> Sensor omissions and telemetry gaps incur deterministic penalties (-8 pts) rather than making overconfident assumptions.
              </li>
              <li>
                <strong className="text-neutral-900">3. Anti-Economic Bias:</strong> Smallholder agricultural plots and large commercial estates receive identical risk prioritization regardless of land valuation.
              </li>
              <li>
                <strong className="text-neutral-900">4. Transparent Risk Engine:</strong> Explainable 7-signal multi-factor scoring (25/20/15/15/10/10/5) with transparent reason attribution.
              </li>
            </ul>
          </section>
        </div>

        <div className="border-t border-neutral-100 pt-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
