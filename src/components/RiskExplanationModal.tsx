import { useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import logoImg from '../img/logo.png'

interface RiskExplanationModalProps {
  onClose: () => void
}

export default function RiskExplanationModal({ onClose }: RiskExplanationModalProps) {
  const { t } = useI18n()

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
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="WildSense Logo" className="h-10 w-10 object-contain rounded-xl shadow-2xs shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  {t('riskExplain.badge')}
                </span>
                <span className="text-xs font-medium text-neutral-500">{t('riskExplain.sdg')}</span>
              </div>
              <h2 id="risk-explanation-title" className="mt-1 text-xl font-black tracking-tight text-neutral-900">
                {t('riskExplain.title')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ✕
          </button>
        </div>

        {/* Overview Box */}
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs leading-relaxed text-emerald-950">
          <p className="font-semibold text-emerald-900">{t('riskExplain.overviewTitle')}</p>
          <p className="mt-1 text-emerald-800">{t('riskExplain.overview')}</p>
        </div>

        {/* 5 Core Environmental Context Signals */}
        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            {t('riskExplain.signalsTitle')}
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">{t('riskExplain.signal1Title')}</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  {t('riskExplain.weight', { n: 20 })}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">{t('riskExplain.signal1Body')}</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">{t('riskExplain.signal2Title')}</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  {t('riskExplain.weight', { n: 25 })}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">{t('riskExplain.signal2Body')}</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">{t('riskExplain.signal3Title')}</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  {t('riskExplain.weight', { n: 15 })}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">{t('riskExplain.signal3Body')}</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">{t('riskExplain.signal4Title')}</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  {t('riskExplain.weight', { n: 5 })}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">{t('riskExplain.signal4Body')}</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 shadow-2xs sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900">{t('riskExplain.signal5Title')}</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                  {t('riskExplain.weight', { n: 10 })}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">{t('riskExplain.signal5Body')}</p>
            </div>
          </div>
        </div>

        {/* Additional Scoring Factors */}
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/40 p-3.5">
          <div className="text-xs font-bold text-neutral-800">{t('riskExplain.additionalTitle')}</div>
          <ul className="mt-1.5 grid gap-2 text-xs text-neutral-600 sm:grid-cols-2">
            <li className="flex items-center justify-between">
              <span>{t('riskExplain.speciesFactor')}</span>
              <span className="font-mono font-bold text-neutral-800">+15 pts</span>
            </li>
            <li className="flex items-center justify-between">
              <span>{t('riskExplain.groupFactor')}</span>
              <span className="font-mono font-bold text-neutral-800">+10 pts</span>
            </li>
          </ul>
        </div>

        {/* Risk Thresholds & Action System */}
        <div className="mt-5 space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            {t('riskExplain.thresholdsTitle')}
          </h3>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs">
              <div className="font-bold text-blue-900">{t('riskExplain.lowTitle')}</div>
              <p className="mt-0.5 text-blue-800">{t('riskExplain.lowBody')}</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs">
              <div className="font-bold text-amber-900">{t('riskExplain.mediumTitle')}</div>
              <p className="mt-0.5 text-amber-800">{t('riskExplain.mediumBody')}</p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs">
              <div className="font-bold text-red-900">{t('riskExplain.highTitle')}</div>
              <p className="mt-0.5 text-red-800">{t('riskExplain.highBody')}</p>
            </div>
          </div>
        </div>

        {/* Data Uncertainty Penalty */}
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/60 p-3.5 text-xs text-amber-950">
          <div className="font-bold text-amber-900">{t('riskExplain.uncertaintyTitle')}</div>
          <p className="mt-1 text-amber-800">{t('riskExplain.uncertaintyBody')}</p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            {t('riskExplain.gotIt')}
          </button>
        </div>
      </div>
    </div>
  )
}