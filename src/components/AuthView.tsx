import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/authContext'
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_MODE_HINT } from '../auth/demoAccount'

const inputCls =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

function AuthView() {
  const { signIn, signUp, errorText } = useAuth()
  const [view, setView] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  const canSubmit =
    view === 'signin'
      ? email.trim() !== '' && password !== ''
      : email.trim() !== '' && password.length >= 6 && name.trim() !== ''

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (busy || !canSubmit) return
    setBusy(true)
    try {
      if (view === 'signin') {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password, name.trim())
      }
    } finally {
      setBusy(false)
    }
  }

  const enterDemo = async () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setBusy(true)
    try {
      await signIn(DEMO_EMAIL, DEMO_PASSWORD)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-neutral-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-1 text-3xl font-bold tracking-tight text-neutral-900">GAHM</div>
        <div className="mb-6 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Wildlife Conflict Risk Engine
        </div>
        <p className="mb-6 text-sm leading-relaxed text-neutral-600">
          GAHM turns scattered wildlife and environmental signals into prioritized, explainable risk alerts.
        </p>

        <div className="mb-5 flex rounded-md bg-neutral-100 p-1">
          <button
            type="button"
            onClick={() => setView('signin')}
            disabled={busy}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
              view === 'signin'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setView('signup')}
            disabled={busy}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
              view === 'signup'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {view === 'signup' ? (
            <div>
              <label htmlFor="auth-name" className="mb-1 block text-xs font-semibold uppercase tracking-widest text-neutral-700">
                Profile name
              </label>
              <input
                id="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className={inputCls}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="auth-email" className="mb-1 block text-xs font-semibold uppercase tracking-widest text-neutral-700">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-1 block text-xs font-semibold uppercase tracking-widest text-neutral-700">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
              className={inputCls}
            />
            {view === 'signup' ? (
              <p className="mt-1 text-xs text-neutral-500">min 6 characters</p>
            ) : null}
          </div>

          {errorText ? (
            <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
              {errorText}
              <p className="mt-1">Check your connection and try again.</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || busy}
            className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {view === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-1 text-sm font-bold text-neutral-900">Try the demo</div>
          <p className="mb-2 text-xs leading-relaxed text-neutral-600">{DEMO_MODE_HINT}</p>
          <p className="mb-3 font-mono text-xs text-neutral-500">
            {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
          <button
            type="button"
            onClick={enterDemo}
            disabled={busy}
            className="w-full rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sign in with demo account
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Each account only ever sees its own data.
        </p>
      </div>
    </div>
  )
}

export default AuthView