import { useRef, useState } from 'react'
import type { ClipboardEvent, FormEvent, KeyboardEvent, ReactNode } from 'react'
import { useAuth } from '../auth/authContext'
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_MODE_HINT } from '../auth/demoAccount'
import { isStaySignedIn, setStaySignedIn } from '../auth/storage'

const MIN_PASSWORD = 8
const MAX_FAILS = 5
const CODE_LENGTH = 6

const inputCls =
  'w-full rounded-md border border-neutral-300 px-3 py-2 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'
const labelCls = 'mb-1 block text-[11px] font-semibold uppercase tracking-widest text-neutral-700'

function BrandLockup() {
  return (
    <div className="mb-6">
      <div className="mb-1 text-3xl font-bold tracking-tight text-neutral-900">GAHM</div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        Wildlife Conflict Risk Engine
      </div>
    </div>
  )
}

function AriaText({ children }: { children: ReactNode }) {
  return (
    <span aria-live="polite" className="sr-only">
      {children}
    </span>
  )
}

function AuthView() {
  const {
    signIn,
    signUp,
    signOut,
    errorText,
    pendingVerification,
    resendCountdown,
    resendCode,
    verifyCode,
    requestPasswordReset,
    signedOutNotice,
    dismissSignedOutNotice,
  } = useAuth()

  const [view, setView] = useState<'signin' | 'signup'>('signin')
  const [step, setStep] = useState<'form' | 'forgot' | 'forgot-sent'>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [stay, setStay] = useState(() => isStaySignedIn())
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)
  const [busy, setBusy] = useState(false)

  const [code, setCode] = useState('')
  const [codeBusy, setCodeBusy] = useState(false)
  const [failCount, setFailCount] = useState(0)
  const boxesRef = useRef<(HTMLInputElement | null)[]>([])

  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotBusy, setForgotBusy] = useState(false)

  const pwOk = password.length >= MIN_PASSWORD
  const confirmOk = confirm !== '' && confirm === password
  const canSubmit =
    view === 'signin'
      ? email.trim() !== '' && password !== ''
      : email.trim() !== '' && name.trim() !== '' && pwOk && confirmOk

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (busy || !canSubmit) return
    setBusy(true)
    dismissSignedOutNotice()
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
    if (busy) return
    setBusy(true)
    dismissSignedOutNotice()
    try {
      await signIn(DEMO_EMAIL, DEMO_PASSWORD)
    } finally {
      setBusy(false)
    }
  }

  const openForgot = () => {
    setForgotEmail(email)
    setStep('forgot')
  }

  const submitForgot = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (forgotBusy || forgotEmail.trim() === '') return
    setForgotBusy(true)
    try {
      const ok = await requestPasswordReset(forgotEmail.trim())
      if (ok) setStep('forgot-sent')
    } finally {
      setForgotBusy(false)
    }
  }

  const onKeyDownPassword = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState?.('CapsLock') ?? false)
  }

  const onDigit = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, '').slice(-1)
    if (!char) return
    const next = code.slice(0, index) + char + code.slice(index + 1)
    setCode(next)
    if (index < CODE_LENGTH - 1) boxesRef.current[index + 1]?.focus()
    if (next.length === CODE_LENGTH && !codeBusy) void submitCode(next)
  }

  const onDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = code.slice(0, index) + code.slice(index + 1)
      setCode(next)
      if (index > 0) boxesRef.current[index - 1]?.focus()
      else boxesRef.current[0]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      boxesRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      boxesRef.current[index + 1]?.focus()
    }
  }

  const onCodePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (digits === '') return
    e.preventDefault()
    setCode(digits)
    if (digits.length === CODE_LENGTH && !codeBusy) void submitCode(digits)
  }

  const submitCode = async (value: string) => {
    if (!pendingVerification || codeBusy) return
    setCodeBusy(true)
    const ok = await verifyCode(pendingVerification.email, value)
    setCodeBusy(false)
    if (!ok) {
      setFailCount((f) => f + 1)
      setCode('')
      boxesRef.current[0]?.focus()
    }
  }

  const requestNewCode = async () => {
    await resendCode()
    setFailCount(0)
    setCode('')
    boxesRef.current[0]?.focus()
  }

  const backFromCode = async () => {
    setCode('')
    setFailCount(0)
    await signOut()
  }

  const tooManyFails = failCount >= MAX_FAILS

  const codeBoxes = Array.from({ length: CODE_LENGTH }, (_, i) => (
    <input
      key={i}
      ref={(el) => {
        boxesRef.current[i] = el
      }}
      id={`code-${i}`}
      aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={1}
      value={code[i] ?? ''}
      disabled={codeBusy || tooManyFails}
      onChange={(e) => onDigit(i, e.target.value)}
      onKeyDown={(e) => onDigitKeyDown(i, e)}
      onPaste={onCodePaste}
      className="h-12 w-11 rounded-md border border-neutral-300 text-center text-xl font-semibold text-neutral-900 focus:border-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
    />
  ))

  const demoCard = (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-1 text-sm font-bold text-neutral-900">Try the demo</div>
      <p className="mb-2 text-xs leading-relaxed text-neutral-600">{DEMO_MODE_HINT}</p>
      <p className="mb-3 font-mono text-xs text-neutral-500">
        {DEMO_EMAIL} / {DEMO_PASSWORD}
      </p>
      <button
        type="button"
        onClick={() => void enterDemo()}
        disabled={busy}
        className="w-full rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Sign in with demo account
      </button>
    </div>
  )

  const errorBox = errorText ? (
    <div
      role="alert"
      className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700"
    >
      {errorText}
    </div>
  ) : null

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden bg-neutral-900 p-4">
      <div className="max-h-full w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <BrandLockup />

        {signedOutNotice ? (
          <div
            role="status"
            className="mb-4 rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-xs text-neutral-600"
          >
            Signed out — sign in to continue.
          </div>
        ) : null}

        {pendingVerification ? (
          <>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Verify your email</h1>
            <p className="mb-6 mt-1 text-sm leading-relaxed text-neutral-600">
              We sent a 6-digit code to <span className="font-semibold text-neutral-800">{pendingVerification.email}</span>.
              Enter it below to finish signing in.
            </p>
            <AriaText>Verification code sent to {pendingVerification.email}</AriaText>

            <div className="flex justify-between gap-2">{codeBoxes}</div>

            <div
              role="alert"
              aria-live="polite"
              className="mt-3 min-h-[2.5rem] text-xs leading-relaxed text-red-700"
            >
              {errorText}
              {tooManyFails ? 'Too many attempts — request a new code, then try again.' : ''}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Check your spam folder if it takes a moment.</span>
              <button
                type="button"
                onClick={() => void requestNewCode()}
                disabled={resendCountdown > 0 || codeBusy}
                className="font-semibold text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void backFromCode()}
              disabled={codeBusy}
              className="mt-4 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back to sign in
            </button>
            {demoCard}
          </>
        ) : step === 'forgot' || step === 'forgot-sent' ? (
          <>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Reset your password</h1>
            <p className="mb-6 mt-1 text-sm leading-relaxed text-neutral-600">
              {step === 'forgot'
                ? 'Enter your account email and we will send you a secure reset link.'
                : `If an account exists for ${forgotEmail}, a reset link is on its way — check your inbox.`}
            </p>

            {step === 'forgot' ? (
              <form onSubmit={submitForgot} className="space-y-4">
                <div>
                  <label htmlFor="auth-forgot-email" className={labelCls}>
                    Email
                  </label>
                  <input
                    id="auth-forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>
                {errorBox}
                <button
                  type="submit"
                  disabled={forgotBusy || forgotEmail.trim() === ''}
                  className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {forgotBusy ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            ) : (
              <div className="mb-4 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs leading-relaxed text-neutral-600">
                The link expires shortly. If you don&apos;t see it, check your spam folder.
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep('form')}
              className="mt-4 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              Back to sign in
            </button>
            {demoCard}
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {view === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mb-6 mt-1 text-sm leading-relaxed text-neutral-600">
              {view === 'signin'
                ? 'Sign in to your workspace of wildlife conflict alerts.'
                : 'One account, one private workspace — your alerts, your decisions.'}
            </p>

            <div className="mb-5 flex rounded-md bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setView('signin')
                  dismissSignedOutNotice()
                }}
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
                onClick={() => {
                  setView('signup')
                  dismissSignedOutNotice()
                }}
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
                  <label htmlFor="auth-name" className={labelCls}>
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
                <label htmlFor="auth-email" className={labelCls}>
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
                <label htmlFor="auth-password" className={labelCls}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPwFocused(true)}
                    onBlur={() => setPwFocused(false)}
                    onKeyDown={onKeyDownPassword}
                    placeholder="••••••••"
                    autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
                {view === 'signup' && pwFocused ? (
                  <p className="mt-1 text-xs text-neutral-500">
                    min {MIN_PASSWORD} characters {pwOk ? '— looks good' : ''}
                  </p>
                ) : null}
                {capsLock ? (
                  <p className="mt-1 text-xs text-amber-600">Caps Lock is on</p>
                ) : null}
              </div>

              {view === 'signup' ? (
                <div>
                  <label htmlFor="auth-confirm" className={labelCls}>
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      onKeyDown={onKeyDownPassword}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      {showConfirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {confirm !== '' && !confirmOk ? (
                    <p className="mt-1 text-xs text-red-600">Passwords don&apos;t match</p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-600">
                  <input
                    type="checkbox"
                    checked={stay}
                    onChange={(e) => {
                      setStay(e.target.checked)
                      setStaySignedIn(e.target.checked)
                    }}
                    className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/40"
                  />
                  Stay signed in
                </label>
                {view === 'signin' ? (
                  <button
                    type="button"
                    onClick={openForgot}
                    className="text-xs font-semibold text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  >
                    Forgot password?
                  </button>
                ) : null}
              </div>

              {errorBox}

              <button
                type="submit"
                disabled={!canSubmit || busy}
                className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? view === 'signin'
                    ? 'Signing in…'
                    : 'Creating account…'
                  : view === 'signin'
                    ? 'Sign in'
                    : 'Create account'}
              </button>
            </form>

            {view === 'signin' ? demoCard : null}
          </>
        )}

        <p className="mt-6 text-center text-xs text-neutral-400">
          Each account only ever sees its own data.
        </p>
      </div>
    </div>
  )
}

export default AuthView