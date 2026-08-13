import { lazy, Suspense, useEffect, useState, useRef } from 'react'
import { useAuth } from './auth/authContext'
import { useGahm } from './store/storeContext'
import { findById } from './store/selectors'
import { formatUtcClock } from './engine/geo'
import { useI18n } from './i18n/I18nContext'
import { LOCALE_IDS } from './i18n'
import LandingView from './components/LandingView'
import SetPassword from './components/SetPassword'
import OperationsBar from './components/OperationsBar'
import FiltersBar from './components/FiltersBar'
import AlertList from './components/AlertList'
import AlertPanel from './components/AlertPanel'
import TeamBoard from './components/TeamBoard'
import SmsSimulator from './components/SmsSimulator'
import DemoTour from './components/DemoTour'
import LanguageSwitcher from './components/LanguageSwitcher'

import EthicsModal from './components/EthicsModal'
import RiskExplanationModal from './components/RiskExplanationModal'
import AuthView from './components/AuthView'

const MapView = lazy(() => import('./components/MapView'))
const NewDetectionForm = lazy(() => import('./components/NewDetectionForm'))

function isEmailAddress(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
}

function fmtNotificationTime(iso: string, locale: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function App() {
  const { mode, user, serverReachable, isBooting, passwordRecovery, signOut } = useAuth()
  const { state, dispatch } = useGahm()
  const { t, lang } = useI18n()

  const isTeammate = typeof window !== 'undefined' && window.location.search.includes('teammate')

  // Teammate window: adopt the assigned sector identity so live actions, the shared
  // audit trail, and the notification feed attribute work to the right ranger.
  useEffect(() => {
    if (mode === 'demo' && isTeammate) {
      dispatch({ type: 'SET_RANGER_NAME', name: 'K. Rao' })
    }
  }, [mode, isTeammate, dispatch])

  const rawRangerName = state.rangerName.trim() || user?.name || ''
  const displayRangerName = isTeammate
    ? 'K. Rao (Masinagudi)'
    : rawRangerName && !isEmailAddress(rawRangerName)
      ? rawRangerName
      : (user?.email ? user.email.split('@')[0] : '') || 'Ranger'

  const [adding, setAdding] = useState(false)
  const [showEthics, setShowEthics] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [showLanding, setShowLanding] = useState(false)
  const [showAuthPage, setShowAuthPage] = useState(false)
  const [runTour, setRunTour] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [mobileTab, setMobileTab] = useState<'map' | 'alerts' | 'team'>('map')

  const notifRef = useRef<HTMLDivElement>(null)
  const overflowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-switch to alerts view on mobile when an alert is selected
  useEffect(() => {
    if (state.selectedId) {
      setMobileTab('alerts')
      dispatch({ type: 'SET_RAIL_TAB', tab: 'alerts' })
    }
  }, [state.selectedId, dispatch])

  // Close popovers on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      // Ignore clicks inside the guided-tour portal: a mousedown there must not
      // close the notification popover, or the tour's active target unmounts
      // mid-click and the tooltip button never receives its click event.
      if (e.target instanceof Node && document.querySelector('#react-joyride-portal')?.contains(e.target)) {
        return
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // Auto-play guided tour for first-time logged-in users upon sign up (unless teammate mode)
  useEffect(() => {
    if (isBooting || mode !== 'user' || !user?.email || isTeammate) return
    const tourKey = `gahm_tour_played_${user.email.toLowerCase()}`
    const justSignedUp = sessionStorage.getItem('gahm_just_signed_up') === 'true'
    if (justSignedUp || !localStorage.getItem(tourKey)) {
      sessionStorage.removeItem('gahm_just_signed_up')
      localStorage.setItem(tourKey, 'true')
      dispatch({ type: 'START_TUTORIAL' })
      setRunTour(true)
    }
  }, [mode, user?.email, isBooting, dispatch, isTeammate])

  // Start tour in demo mode by default (unless teammate mode)
  useEffect(() => {
    if (mode === 'demo' && !isTeammate) {
      setRunTour(true)
    }
  }, [mode, isTeammate])

  const handleStartTour = () => {
    if (mode === 'demo') {
      dispatch({ type: 'RESET_DEMO' })
    } else {
      dispatch({ type: 'START_TUTORIAL' })
    }
    setRunTour(true)
  }

  const handleFinishTour = () => {
    setRunTour(false)
    if (mode === 'user' && state.inTutorial) {
      dispatch({ type: 'FINISH_TUTORIAL' })
    }
  }

  const handleOpenTeamView = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin + window.location.pathname + '?teammate'
      window.open(url, '_blank')
    }
  }

  if (isBooting) {
    return (
      <div className="flex h-dvh items-center justify-center bg-neutral-900 text-white">
        {t('app.boot')}
      </div>
    )
  }

  if (passwordRecovery && mode !== 'demo') {
    return <SetPassword />
  }

  if (!mode) {
    return showAuthPage ? (
      <AuthView onBackToLanding={() => setShowAuthPage(false)} />
    ) : (
      <LandingView />
    )
  }

  if (showLanding) {
    return <LandingView onReturnToDashboard={() => setShowLanding(false)} />
  }

  const selected = state.selectedId ? findById(state.events, state.selectedId) : undefined
  const demoMode = mode === 'demo'
  const unreadCount = state.notifications.filter((n) => !n.read).length

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-neutral-100 font-sans text-neutral-900 antialiased">
      <DemoTour
        runTour={runTour}
        onFinishTour={handleFinishTour}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      {/* Teammate Mode Banner */}
      {isTeammate ? (
        <div className="flex items-center justify-between border-b border-sky-400 bg-sky-900 px-4 py-1.5 text-xs font-semibold text-sky-100">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
            {t('app.teammateBanner', { persona: 'K. Rao — Masinagudi sector' })}
          </span>
          <span className="rounded bg-sky-800 px-2 py-0.5 text-[10px] font-bold text-sky-200 uppercase">
            Live Sync Active
          </span>
        </div>
      ) : null}

      {/* Header */}
      <header className="relative z-[1200] flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 text-white">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLanding(true)}
              aria-label={t('app.brandAria')}
              className="text-base font-extrabold tracking-tight text-white transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:text-lg"
            >
              WildSense
            </button>
            <span className="hidden text-xs font-medium text-neutral-400 sm:inline">
              {t('app.brandTagline')}
            </span>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              demoMode
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40 ring-inset'
                : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 ring-inset'
            }`}
          >
            {demoMode ? t('app.demoMode') : t('app.liveMode')}
          </span>

          <span className="hidden items-center gap-1.5 font-mono text-xs text-neutral-400 md:inline-flex" aria-live="polite">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
            <span>{formatUtcClock(now)}</span>
          </span>
        </div>

        {/* Right Nav / Actions */}
        <nav aria-label={t('app.navLabel')} className="flex items-center gap-2 sm:gap-2.5">
          {/* Primary Action: Log detection */}
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label={t('app.logDetectionAria')}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-800 active:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t('app.logDetection')}
          </button>

          {/* Open Team View (Presenter 2-window demo launcher) */}
          {demoMode && !isTeammate ? (
            <button
              type="button"
              onClick={handleOpenTeamView}
              aria-label={t('app.openTeamViewAria')}
              className="hidden min-h-[40px] items-center justify-center rounded-lg border border-sky-500/50 bg-sky-950/60 px-2.5 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-900/80 hover:text-sky-200 lg:inline-flex"
            >
              👥 {t('app.openTeamView')}
            </button>
          ) : null}

          {/* Notification Bell Dropdown */}
          <div ref={notifRef} className="relative z-[1210]">
            <button
              type="button"
              data-tour="bell-btn"
              onClick={() => {
                setShowNotifications((s) => !s)
                dispatch({ type: 'MARK_NOTIFICATIONS_READ' })
              }}
              aria-label={t('app.notificationsAria', { count: unreadCount })}
              className="relative inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-neutral-700 bg-neutral-850 p-2 text-neutral-300 transition-colors hover:bg-neutral-750 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              🔔
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-neutral-950 animate-pulse">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifications ? (
              <div
                data-tour="notif-popover"
                className="absolute right-0 top-12 z-[1250] w-80 max-w-[90vw] rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-white shadow-2xl space-y-2"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-bold">{t('notifications.title')}</span>
                  {state.notifications.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
                      className="text-[10px] font-semibold text-neutral-400 hover:text-emerald-400"
                    >
                      {t('notifications.clearAll')}
                    </button>
                  ) : null}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {state.notifications.length === 0 ? (
                    <p className="py-4 text-center text-xs text-neutral-500">
                      {t('notifications.empty')}
                    </p>
                  ) : (
                    state.notifications.map((n) => {
                      const isKRao = n.actor === 'K. Rao' || n.id === 'seed-notif-1'
                      return (
                        <div
                          key={n.id}
                          data-tour={isKRao ? 'notif-item-k-rao' : undefined}
                          onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id })}
                          className={`rounded-lg p-2.5 text-xs transition-colors cursor-pointer ${
                            isKRao
                              ? 'border border-sky-400/80 bg-sky-950/70 text-white shadow-sm ring-1 ring-sky-400/30'
                              : n.read
                              ? 'bg-neutral-800/40 text-neutral-400'
                              : 'bg-neutral-800 text-neutral-100'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className={`font-bold ${isKRao ? 'text-sky-300' : 'text-neutral-200'}`}>
                              {n.actor ?? n.title ?? 'System'}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {fmtNotificationTime(n.timestamp, LOCALE_IDS[lang])}
                            </span>
                          </div>
                          <p className={`mt-0.5 text-[11px] leading-tight ${isKRao ? 'text-sky-100 font-medium' : 'text-neutral-300'}`}>
                            {n.message}
                          </p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <LanguageSwitcher variant="header" />

          {/* User Profile Indicator */}
          <span
            className="hidden min-h-[40px] items-center gap-1.5 rounded-lg border border-neutral-700/80 bg-neutral-850 px-2.5 py-1 text-xs font-medium text-neutral-200 sm:inline-flex"
            aria-label={t('app.profileAria', { name: displayRangerName })}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="hidden lg:inline">{displayRangerName}</span>
            <span className="lg:hidden">{displayRangerName.split(' ')[0]}</span>
          </span>

          {/* Overflow Menu ("More" / `...`) for Secondary Actions */}
          <div ref={overflowRef} className="relative">
            <button
              type="button"
              onClick={() => setShowOverflowMenu((s) => !s)}
              aria-label={t('app.overflowAria')}
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-neutral-700 bg-neutral-850 p-2 text-neutral-300 transition-colors hover:bg-neutral-750 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              ⋯
            </button>

            {showOverflowMenu ? (
              <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-neutral-700 bg-neutral-900 p-1.5 text-white shadow-2xl space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowOverflowMenu(false)
                    handleStartTour()
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white"
                >
                  🎯 {t('app.guidedTour')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOverflowMenu(false)
                    setShowRiskModal(true)
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white"
                >
                  📊 {t('app.riskEngine')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOverflowMenu(false)
                    setShowEthics(true)
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white"
                >
                  ⚖️ {t('app.ethicsLegal')}
                </button>
                {demoMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowOverflowMenu(false)
                      dispatch({ type: 'RESET_DEMO' })
                      setRunTour(true)
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-amber-300 hover:bg-neutral-800"
                  >
                    🔄 {t('app.resetDemo')}
                  </button>
                ) : null}
                <div className="my-1 border-t border-neutral-800" />
                <button
                  type="button"
                  onClick={() => {
                    setShowOverflowMenu(false)
                    setShowLanding(true)
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800"
                >
                  🏠 {t('app.landingPage')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOverflowMenu(false)
                    setAdding(false)
                    setShowAuthPage(true)
                    void signOut()
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-neutral-800 hover:text-red-300"
                >
                  🚪 {t('app.signOut')}
                </button>
              </div>
            ) : null}
          </div>
        </nav>
      </header>

      {demoMode && !serverReachable ? (
        <div className="flex items-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-900">
          {t('app.serverUnreachableBanner')}
        </div>
      ) : null}
      {!demoMode && state.notPersisted ? (
        <div className="flex items-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-900">
          {t('app.notSavedBanner')}
        </div>
      ) : null}
      {!demoMode && state.inTutorial ? (
        <div className="flex items-center justify-between border-b border-emerald-400 bg-emerald-900 px-4 py-1.5 text-xs font-semibold text-emerald-100">
          <span>{t('app.tutorialBanner')}</span>
          <button
            type="button"
            onClick={handleFinishTour}
            className="rounded bg-emerald-800 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-emerald-700"
          >
            {t('app.exitTutorial')}
          </button>
        </div>
      ) : null}

      <div className="relative z-10 isolate">
        <OperationsBar />
      </div>

      {/* Mobile View Mode Switcher (< 768px) */}
      <div className="flex border-b border-neutral-300 bg-neutral-200/90 p-1 md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex-1 rounded-md py-2 text-xs font-bold transition-all ${
            mobileTab === 'map'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-neutral-700 hover:bg-neutral-300/80'
          }`}
        >
          🗺️ {t('app.mapView')}
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileTab('alerts')
            dispatch({ type: 'SET_RAIL_TAB', tab: 'alerts' })
          }}
          className={`flex-1 rounded-md py-2 text-xs font-bold transition-all ${
            mobileTab === 'alerts'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-neutral-700 hover:bg-neutral-300/80'
          }`}
        >
          🔔 {t('app.alertsView', { count: state.events.length > 0 ? `(${state.events.length})` : '' })}
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileTab('team')
            dispatch({ type: 'SET_RAIL_TAB', tab: 'team' })
          }}
          className={`flex-1 rounded-md py-2 text-xs font-bold transition-all ${
            mobileTab === 'team'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-neutral-700 hover:bg-neutral-300/80'
          }`}
        >
          👥 {t('app.teamView')}
        </button>
      </div>

      <main className="relative z-0 isolate flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Left / Center: Interactive Map */}
        <div
          className={
            mobileTab === 'map'
              ? 'flex min-h-0 min-w-0 flex-1 flex-col'
              : 'hidden md:flex md:min-h-0 md:min-w-0 md:flex-1 md:flex-col'
          }
        >
          <div className="h-full w-full">
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-xs text-neutral-500">
                  {t('app.loadingMap')}
                </div>
              }
            >
              <MapView />
            </Suspense>
          </div>
        </div>

        {/* Right: Tabbed Sidebar (Alerts / Team) */}
        <div
          className={
            mobileTab === 'alerts' || mobileTab === 'team'
              ? 'flex min-h-0 flex-1 flex-col border-t border-neutral-300 bg-white md:h-auto md:w-[360px] lg:w-[390px] md:flex-none md:shrink-0 md:border-l md:border-t-0'
              : 'hidden md:flex md:h-auto md:w-[360px] lg:w-[390px] md:flex-none md:shrink-0 md:flex-col md:border-l md:border-neutral-300 md:bg-white'
          }
        >
          {/* Sidebar Tab Header */}
          <div className="flex shrink-0 items-center border-b border-neutral-200 bg-neutral-100/90 p-1.5">
            <button
              type="button"
              data-tour="alerts-tab"
              onClick={() => dispatch({ type: 'SET_RAIL_TAB', tab: 'alerts' })}
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all ${
                state.railTab === 'alerts'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              🔔 {t('rail.alertsTab')} ({state.events.length})
            </button>
            <button
              type="button"
              data-tour="team-tab"
              onClick={() => dispatch({ type: 'SET_RAIL_TAB', tab: 'team' })}
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all ${
                state.railTab === 'team'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              👥 {t('rail.teamTab')} ({state.profiles.length || 1})
            </button>
          </div>

          {/* Active Sidebar Tab Content */}
          {state.railTab === 'team' ? (
            <TeamBoard />
          ) : (
            <>
              <FiltersBar />
              {selected ? (
                <AlertPanel event={selected} onOpenRiskExplanation={() => setShowRiskModal(true)} />
              ) : (
                <AlertList />
              )}
            </>
          )}
        </div>
      </main>

      {state.sms.openEventId ? <SmsSimulator /> : null}
      {showEthics ? <EthicsModal onClose={() => setShowEthics(false)} /> : null}
      {showRiskModal ? <RiskExplanationModal onClose={() => setShowRiskModal(false)} /> : null}
      {adding ? (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
              <div className="rounded-md bg-white px-4 py-3 text-xs text-neutral-600">
                {t('app.loadingForm')}
              </div>
            </div>
          }
        >
          <NewDetectionForm onClose={() => setAdding(false)} />
        </Suspense>
      ) : null}
    </div>
  )
}

export default App