import { lazy, Suspense, useEffect, useState } from 'react'
import { useAuth } from './auth/authContext'
import { useGahm } from './store/storeContext'
import { findById } from './store/selectors'
import { formatUtcClock } from './engine/geo'
import AuthView from './components/AuthView'
import SetPassword from './components/SetPassword'
import OperationsBar from './components/OperationsBar'
import FiltersBar from './components/FiltersBar'
import AlertList from './components/AlertList'
import AlertPanel from './components/AlertPanel'
import SmsSimulator from './components/SmsSimulator'
import DemoTour from './components/DemoTour'

import EthicsModal from './components/EthicsModal'

const MapView = lazy(() => import('./components/MapView'))
const NewDetectionForm = lazy(() => import('./components/NewDetectionForm'))

function App() {
  const { mode, serverReachable, isBooting, passwordRecovery, signOut } = useAuth()
  const { state, dispatch } = useGahm()

  const [adding, setAdding] = useState(false)
  const [showEthics, setShowEthics] = useState(false)
  const [runTour, setRunTour] = useState(true)
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

  if (isBooting) {
    return (
      <div className="flex h-dvh items-center justify-center bg-neutral-900 text-white">
        GAHM…
      </div>
    )
  }

  if (passwordRecovery && mode !== 'demo') {
    return <SetPassword />
  }

  if (!mode) {
    return <AuthView />
  }

  const demoMode = mode === 'demo'
  const selected = state.selectedId ? findById(state.events, state.selectedId) : undefined

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-neutral-100 text-neutral-900">
      {demoMode ? (
        <DemoTour runTour={runTour} onFinishTour={() => setRunTour(false)} />
      ) : null}
      <header className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-neutral-800 bg-neutral-900 px-3 py-2 text-white sm:px-4 sm:py-2.5">
        {/* Zone 1: Brand & System Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold tracking-tight text-white">
              GAHM
            </span>
            <span
              className="hidden text-[11px] font-semibold text-neutral-400 sm:inline"
              aria-label="Wildlife Conflict Risk Engine"
            >
              Wildlife Conflict Risk Engine
            </span>
          </div>

          {demoMode ? (
            <span
              className="rounded-full border border-neutral-700 bg-neutral-800/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300"
              aria-label="Operating mode: Demo data"
            >
              Demo data
            </span>
          ) : (
            <span
              className="rounded-full border border-emerald-700/60 bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300"
              aria-label="Operating mode: Live mode"
            >
              Live mode
            </span>
          )}

          <span
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400"
            aria-label={`Live UTC Clock: ${formatUtcClock(now)}`}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="font-mono font-medium text-neutral-300">
              {formatUtcClock(now)}
            </span>
          </span>
        </div>

        {/* Main Navigation with Zone 2 & Zone 3 */}
        <nav
          aria-label="Main Navigation"
          className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3"
        >
          {/* Zone 2: Primary User Actions */}
          <div className="flex items-center gap-2">
            {demoMode ? (
              <button
                type="button"
                onClick={() => setRunTour(true)}
                aria-label="Start guided demo tour"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-emerald-500/80 bg-emerald-950/70 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-xs transition-colors hover:border-emerald-400 hover:bg-emerald-900/80 hover:text-emerald-200 active:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                Guided tour
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setAdding(true)}
              aria-label="Log new wildlife detection"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 active:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              Log detection
            </button>
          </div>

          {/* Visual Divider */}
          <div className="hidden h-5 w-px bg-neutral-700 sm:block" aria-hidden="true" />

          {/* Zone 3: Account & Secondary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* User Profile Indicator */}
            <span
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-neutral-700/80 bg-neutral-800/90 px-2.5 py-1 text-xs font-medium text-neutral-200"
              aria-label={`Ranger profile: ${state.rangerName}`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="hidden sm:inline">{state.rangerName}</span>
              <span className="sm:hidden">{state.rangerName.split(' ')[0]}</span>
            </span>

            {demoMode ? (
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'RESET_DEMO' })
                  setRunTour(true)
                }}
                aria-label="Reset demo data and restart tour"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-700 hover:text-white active:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                Reset demo
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setShowEthics(true)}
              aria-label="View ethics and legal compliance modal"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white active:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              Ethics &amp; Legal
            </button>

            <button
              type="button"
              onClick={() => {
                setAdding(false)
                void signOut()
              }}
              aria-label="Sign out of account"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-transparent px-2.5 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white active:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>

      {demoMode && !serverReachable ? (
        <div className="flex items-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-900">
          Server unreachable — demo mode
        </div>
      ) : null}
      {!demoMode && state.notPersisted ? (
        <div className="flex items-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-900">
          Changes not saved — server unreachable
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
          🗺️ Map View
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
          🔔 Alerts &amp; Details {state.events.length > 0 ? `(${state.events.length})` : ''}
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
                  Loading map…
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
          {selected ? <AlertPanel event={selected} /> : <AlertList />}
        </div>
      </main>

      {state.sms.openEventId ? <SmsSimulator /> : null}
      {showEthics ? <EthicsModal onClose={() => setShowEthics(false)} /> : null}
      {adding ? (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
              <div className="rounded-md bg-white px-4 py-3 text-xs text-neutral-600">
                Loading form…
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