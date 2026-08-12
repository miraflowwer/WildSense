import { useState } from 'react'
import { useAuth } from './auth/authContext'
import { useGahm } from './store/store'
import { findById } from './store/selectors'
import { formatTime } from './engine/geo'
import MapView from './components/MapView'
import AuthView from './components/AuthView'
import OperationsBar from './components/OperationsBar'
import FiltersBar from './components/FiltersBar'
import AlertList from './components/AlertList'
import AlertPanel from './components/AlertPanel'
import SmsSimulator from './components/SmsSimulator'
import NewDetectionForm from './components/NewDetectionForm'

function App() {
  const { mode, serverReachable, isBooting, signOut } = useAuth()
  const { state, dispatch } = useGahm()

  const [adding, setAdding] = useState(false)
  const [clickPos, setClickPos] = useState<{ lat: number; lng: number } | null>(null)

  if (isBooting) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-white">
        GAHM…
      </div>
    )
  }

  if (!mode) {
    return <AuthView />
  }

  const demoMode = mode === 'demo'
  const selected = state.selectedId ? findById(state.events, state.selectedId) : undefined

  return (
    <div className="flex h-screen flex-col bg-neutral-100 text-neutral-900">
      <header className="flex items-center gap-4 bg-neutral-900 px-4 py-2.5 text-white">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight">GAHM</span>
          <span className="text-[11px] text-neutral-400">Wildlife Conflict Risk Engine</span>
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
            <span className="font-medium text-neutral-100">{state.rangerName}</span>
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
              onClick={() => {
                setAdding(true)
                setClickPos(null)
              }}
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

      <main className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <div className="h-full w-full">
            <MapView addMode={adding} clickPosition={clickPos} onMapClick={(p) => setClickPos(p)} />
          </div>
        </div>
        <div className="flex min-h-0 w-[360px] shrink-0 flex-col border-l border-neutral-200 bg-white">
          <FiltersBar />
          {selected ? <AlertPanel event={selected} /> : <AlertList />}
        </div>
      </main>

      {state.sms.openEventId ? <SmsSimulator /> : null}
      {adding ? (
        <NewDetectionForm
          position={clickPos}
          onClose={() => {
            setAdding(false)
            setClickPos(null)
          }}
        />
      ) : null}
    </div>
  )
}

export default App