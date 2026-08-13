import { lazy, Suspense, useEffect, useState } from 'react'
import { useAuth } from './auth/authContext'
import { useGahm } from './store/storeContext'
import { findById } from './store/selectors'
import { formatUtcClock } from './engine/geo'
import { useI18n } from './i18n/I18nContext'
import LandingView from './components/LandingView'
import SetPassword from './components/SetPassword'
import OperationsBar from './components/OperationsBar'
import FiltersBar from './components/FiltersBar'
import AlertList from './components/AlertList'
import AlertPanel from './components/AlertPanel'
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

function App() {
  const { mode, user, serverReachable, isBooting, passwordRecovery, signOut } = useAuth()
  const { state, dispatch } = useGahm()
  const { t } = useI18n()

  const rawRangerName = state.rangerName.trim() || user?.name || ''
  const displayRangerName =
    rawRangerName && !isEmailAddress(rawRangerName)
      ? rawRangerName
      : (user?.email ? user.email.split('@')[0] : '') || 'Ranger'

  const [adding, setAdding] = useState(false)
  const [showEthics, setShowEthics] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [showLanding, setShowLanding] = useState(false)
  const [showAuthPage, setShowAuthPage] = useState(false)
  const [runTour, setRunTour] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [mobileTab, setMobileTab] = useState<'map' | 'alerts'>('map')

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-switch to alerts view on mobile when an alert is selected
  useEffect(() => {
    if (state.selectedId) {
      setMobileTab('alerts')
    }
  }, [state.selectedId])

  // Auto-play guided tour for first-time logged-in users upon sign up
  useEffect(() => {
    if (isBooting || mode !== 'user' || !user?.email) return
    const tourKey = `gahm_tour_played_${user.email.toLowerCase()}`
    const justSignedUp = sessionStorage.getItem('gahm_just_signed_up') === 'true'
    if (justSignedUp || !localStorage.getItem(tourKey)) {
      sessionStorage.removeItem('gahm_just_signed_up')
      localStorage.setItem(tourKey, 'true')
      dispatch({ type: 'START_TUTORIAL' })
      setRunTour(true)
    }
  }, [mode, user?.email, isBooting, dispatch])

  // Start tour in demo mode by default
  useEffect(() => {
    if (mode === 'demo') {
      setRunTour(true)
    }
  }, [mode])

  const handleStartTour = () => {
    if (mode === 'demo') {
      // Reset to a pristine scenario so every tour run starts from a clean, scripted state
      // (a previously resolved EVT-1042 would otherwise be filtered out and stall the tour).
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

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-neutral-100 font-sans text-neutral-900 antialiased">
      <DemoTour runTour={runTour} onFinishTour={handleFinishTour} />

      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 text-white">
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
        <nav aria-label={t('app.navLabel')} className="flex items-center gap-2 sm:gap-3">
          {/* Primary Action: Log detection */}
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label={t('app.logDetectionAria')}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-800 active:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          >
            {t('app.logDetection')}
          </button>

          {/* Secondary Action: Guided Tour (Available for all users) */}
          <button
            type="button"
            onClick={handleStartTour}
            aria-label={t('app.guidedTourAria')}
            className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-emerald-500/50 bg-emerald-950/60 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-900/80 hover:text-emerald-200 active:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 xl:inline-flex"
          >
            {t('app.guidedTour')}
          </button>

          {/* Risk Engine Explanation Button */}
          <button
            type="button"
            onClick={() => setShowRiskModal(true)}
            aria-label={t('app.riskEngineAria')}
            className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-900/70 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 md:inline-flex"
          >
            {t('app.riskEngine')}
          </button>

          {/* Visual Divider */}
          <div className="h-5 w-[1px] bg-neutral-800" aria-hidden="true" />

          {/* Zone 3: User Profile Indicator & Account Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="header" />

            {/* User Profile Indicator */}
            <span
              className="hidden min-h-[44px] items-center gap-1.5 rounded-md border border-neutral-700/80 bg-neutral-800/90 px-2.5 py-1 text-xs font-medium text-neutral-200 sm:inline-flex"
              aria-label={t('app.profileAria', { name: displayRangerName })}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="hidden lg:inline">{displayRangerName}</span>
              <span className="lg:hidden">{displayRangerName.split(' ')[0]}</span>
            </span>

            {demoMode ? (
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'RESET_DEMO' })
                  setRunTour(true)
                }}
                aria-label={t('app.resetDemoAria')}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-700 hover:text-white active:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                {t('app.resetDemo')}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setShowEthics(true)}
              aria-label={t('app.ethicsAria')}
              className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white active:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 md:inline-flex"
            >
              {t('app.ethicsLegal')}
            </button>

            <button
              type="button"
              onClick={() => {
                setAdding(false)
                setShowAuthPage(true)
                void signOut()
              }}
              aria-label={t('app.signOutAria')}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-transparent px-2.5 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white active:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              {t('app.signOut')}
            </button>
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

      <OperationsBar />

      {/* Mobile Phone View Mode Switcher (< 768px) */}
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
          onClick={() => setMobileTab('alerts')}
          className={`flex-1 rounded-md py-2 text-xs font-bold transition-all ${
            mobileTab === 'alerts'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-neutral-700 hover:bg-neutral-300/80'
          }`}
        >
          🔔 {t('app.alertsView', { count: state.events.length > 0 ? `(${state.events.length})` : '' })}
        </button>
      </div>

      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
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
        <div
          className={
            mobileTab === 'alerts'
              ? 'flex min-h-0 flex-1 flex-col border-t border-neutral-300 bg-white md:h-auto md:w-[360px] lg:w-[380px] md:flex-none md:shrink-0 md:border-l md:border-t-0'
              : 'hidden md:flex md:h-auto md:w-[360px] lg:w-[380px] md:flex-none md:shrink-0 md:flex-col md:border-l md:border-neutral-300 md:bg-white'
          }
        >
          <FiltersBar />
          {selected ? (
            <AlertPanel event={selected} onOpenRiskExplanation={() => setShowRiskModal(true)} />
          ) : (
            <AlertList />
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