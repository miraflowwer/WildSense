import { lazy, Suspense, useState } from 'react'
import { useAuth } from './auth/authContext'
import { useGahm } from './store/storeContext'
import { findById } from './store/selectors'
import { formatTime } from './engine/geo'
import AuthView from './components/AuthView'
import SetPassword from './components/SetPassword'
import OperationsBar from './components/OperationsBar'
import FiltersBar from './components/FiltersBar'
import AlertList from './components/AlertList'
import AlertPanel from './components/AlertPanel'
import SmsSimulator from './components/SmsSimulator'

const MapView = lazy(() => import('./components/MapView'))
const NewDetectionForm = lazy(() => import('./components/NewDetectionForm'))

function App() {
  const { mode, serverReachable, isBooting, passwordRecovery, signOut } = useAuth()
  const { state, dispatch } = useGahm()

  const [adding, setAdding] = useState(false)

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
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-neutral-900 px-4 py-2.5 text-white">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight">GAHM</span>
          <span className="hidden text-[11px] text-neutral-400 sm:inline">Wildlife Conflict Risk Engine</span>
        </div>
        {demoMode ? (
          <span className="rounded-full bg-neutral-700 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-200">
            Demo data
          </span>
        ) : (
          <span className="ml-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            {state.rangerName}
          </span>
        )}
        <span className="hidden text-xs text-neutral-500 sm:inline">
          Synced {formatTime(state.lastSyncAt)} UTC
        </span>
        <div className="ml-auto flex items-center gap-3 text-xs">
          {demoMode ? (
            <span className="hidden font-medium text-neutral-100 sm:inline">{state.rangerName}</span>
          ) : null}
          {demoMode ? (
            <button
              type="button"
              onClick={() => dispatch({ type: 'RESET_DEMO' })}
              className="rounded-md border border-neutral-600 px-2.5 py-1 text-neutral-200 transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              Reset demo
            </button>
          ) : null}
          {!demoMode ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-md bg-emerald-600 px-2.5 py-1 font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Log detection
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setAdding(false)
              void signOut()
            }}
            className="rounded-md px-2.5 py-1 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Sign out
          </button>
        </div>
      </header>

      {demoMode && !serverReachable ? (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-900">
          Server unreachable — demo mode
        </div>
      ) : null}
      {!demoMode && state.notPersisted ? (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-900">
          Changes not saved — server unreachable
        </div>
      ) : null}

      <OperationsBar />

      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 min-w-0 flex-1">
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
        <div className="flex h-[40%] min-h-0 w-full shrink-0 flex-col border-t border-neutral-200 bg-white md:h-auto md:w-[360px] md:border-l md:border-t-0">
          <FiltersBar />
          {selected ? <AlertPanel event={selected} /> : <AlertList />}
        </div>
      </main>

      {state.sms.openEventId ? <SmsSimulator /> : null}
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