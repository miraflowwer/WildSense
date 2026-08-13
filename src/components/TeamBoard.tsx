import { useMemo } from 'react'
import { useGahm } from '../store/storeContext'
import { useI18n } from '../i18n/I18nContext'
import { LOCALE_IDS } from '../i18n'
import type { RangerProfile } from '../types'

function fmtDutyTime(iso: string, locale: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function TeamBoard() {
  const { state } = useGahm()
  const { t, lang } = useI18n()

  const profiles = useMemo(() => {
    return state.profiles.length > 0
      ? state.profiles
      : [
          {
            userId: 'self',
            name: state.rangerName || 'Current Ranger',
            sector: state.rangerSector || 'Central Corridor',
            onDutySince: new Date().toISOString(),
            lastAction: 'Active on Duty',
            lastActiveAt: new Date().toISOString(),
          } as RangerProfile,
        ]
  }, [state.profiles, state.rangerName, state.rangerSector])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">{t('team.title')}</h2>
          <p className="text-[11px] text-neutral-500">{t('team.subtitle', { count: profiles.length })}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" aria-hidden="true" />
          {t('team.liveStatus')}
        </span>
      </div>

      <div className="space-y-2.5">
        {profiles.map((p) => {
          const isCurrentUser = p.name === state.rangerName
          return (
            <div
              key={p.userId || p.name}
              className={`rounded-xl border p-3.5 shadow-2xs transition-all ${
                isCurrentUser
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white shadow-2xs">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900">{p.name}</span>
                      {isCurrentUser ? (
                        <span className="rounded bg-emerald-600 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-white">
                          {t('team.youBadge')}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[11px] font-medium text-neutral-500">
                      {p.sector || 'Central Corridor'} {t('team.sectorSuffix')}
                    </div>
                  </div>
                </div>

                <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                  {t('team.onDutyAt', { time: fmtDutyTime(p.onDutySince, LOCALE_IDS[lang]) })}
                </span>
              </div>

              {p.lastAction ? (
                <div className="mt-2.5 rounded-lg border border-neutral-150 bg-neutral-50/80 px-2.5 py-1.5 text-[11px] text-neutral-700">
                  <span className="font-semibold text-neutral-900">{t('team.latestActivity')}:</span>{' '}
                  <span>{p.lastAction}</span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
