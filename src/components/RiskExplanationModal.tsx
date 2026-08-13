import { useEffect } from 'react'

interface RiskExplanationModalProps {
  onClose: () => void
}

export default function RiskExplanationModal({ onClose }: RiskExplanationModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-explanation-title"
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                Risk Engine Specification
              </span>
              <span className="text-xs font-medium text-neutral-500">SDG 15 Life on Land</span>
            </div>
            <h2 id="risk-explanation-title" className="mt-1 text-xl font-black tracking-tight text-neutral-900">
              How Conflict Risk is Calculated
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ✕
          </button>
        </div>

        {/* Overview Box */}
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs leading-relaxed text-emerald-950">
          <p className="font-semibold text-emerald-900">
            Multi-Signal Risk Aggregation &amp; Threshold Filtering
          </p>
          <p className="mt-1 text-emerald-800">
            Instead of generating an alert for every single wildlife detection, GAHM identifies patterns across multiple environmental context signals. It automatically filters out routine animal behavior and generates targeted, explainable alerts only when the calculated risk crosses a defined threshold.
          </p>
        </div>

        {/* 5 Core Environmental Context Signals */}
        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            5 Core Environmental Context Signals
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">1. Animal Movement &amp; Direction</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  Weight: 20 pts
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                Is the detected animal heading directly toward a human settlement, or moving parallel/away? Headward movement adds maximum risk points (+20).
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">2. Proximity to Farms</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  Weight: 25 pts
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                Calculates precise distance to vulnerable human agriculture and residential zones. Highest priority (+25) within 1 km.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">3. Historical Conflict Data</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  Weight: 15 pts
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                Checks if the exact location is a known historical hotspot for past crop-raiding, property damage, or human-wildlife encounters.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">4. Weather &amp; Environmental</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  Weight: 5 pts
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                Seasonal conditions (like dry season droughts or post-monsoon crop ripening) force elephants and large fauna to forage near villages.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">5. Time of Day (Activity Windows)</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  Weight: 10 pts
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                Peak risk occurs during dusk (17:00–20:00) and dawn (05:00–08:00) when visibility is low and wildlife movement overlaps human agricultural hours.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Scoring Factors */}
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/40 p-3.5">
          <div className="text-xs font-bold text-neutral-800">Additional Signal Factors:</div>
          <ul className="mt-1.5 grid gap-2 text-xs text-neutral-600 sm:grid-cols-2">
            <li className="flex items-center justify-between">
              <span>• Species Impact Factor (Elephant, Tiger, Leopard)</span>
              <span className="font-mono font-bold text-neutral-800">+15 pts</span>
            </li>
            <li className="flex items-center justify-between">
              <span>• Group Size &amp; Herd Count</span>
              <span className="font-mono font-bold text-neutral-800">+10 pts</span>
            </li>
          </ul>
        </div>

        {/* Risk Thresholds & Action System */}
        <div className="mt-5 space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            Defined Risk Thresholds &amp; Automated Actions
          </h3>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs">
              <div className="font-bold text-blue-900">Low Risk (&lt; 40)</div>
              <p className="mt-0.5 text-blue-800">
                Routine animal detection. Logged passively for ecological tracking. No immediate ranger dispatch.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs">
              <div className="font-bold text-amber-900">Medium Risk (40–69)</div>
              <p className="mt-0.5 text-amber-800">
                Elevated conflict threat. Added to active monitoring; alerts rangers to schedule a field check.
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs">
              <div className="font-bold text-red-900">High Risk (≥ 70)</div>
              <p className="mt-0.5 text-red-800">
                Critical imminent threat. Triggers immediate ranger unit contact and community SMS warning preview.
              </p>
            </div>
          </div>
        </div>

        {/* Data Uncertainty Penalty */}
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/60 p-3.5 text-xs text-amber-950">
          <div className="font-bold text-amber-900">Data Uncertainty &amp; Safety Buffer</div>
          <p className="mt-1 text-amber-800">
            If sensor movement data or species confidence is missing, GAHM applies an explicit uncertainty penalty (-8 pts) and highlights an alert banner. Rather than making blind assumptions, it alerts human operators to manually review unverified detections.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            Got it, return to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
