import { useState, useEffect } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useAuth } from '../auth/authContext'
import { UNREACHABLE_MESSAGE } from '../auth/AuthProvider'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../auth/demoAccount'
import { isStaySignedIn, setStaySignedIn } from '../auth/storage'
import { useI18n } from '../i18n/I18nContext'
import LanguageSwitcher from './LanguageSwitcher'

const MIN_PASSWORD = 8

const inputCls =
  'w-full rounded-md border border-neutral-300 px-3 py-2 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'
const labelCls = 'mb-1 block text-[11px] font-semibold uppercase tracking-widest text-neutral-700'

function BrandLockup() {
  const { t } = useI18n()
  return (
    <div className="mb-6">
      <div className="mb-1 text-3xl font-bold tracking-tight text-neutral-900">GAHM</div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        {t('app.brandTagline')}
      </div>
    </div>
  )
}

function isEmailAddress(val: string): boolean {
  const trimmed = val.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

export interface AuthViewProps {
  initialView?: 'signin' | 'signup'
  isModal?: boolean
  onClose?: () => void
  onBackToLanding?: () => void
}

function AuthView({
  initialView = 'signin',
  isModal = false,
  onClose,
  onBackToLanding,
}: AuthViewProps = {}) {
  const {
    signIn,
    signUp,
    errorText,
    requestPasswordReset,
    signedOutNotice,
    dismissSignedOutNotice,
    clearError,
  } = useAuth()
  const { t } = useI18n()

  const [view, setView] = useState<'signin' | 'signup'>(initialView)
  const [step, setStep] = useState<'form' | 'forgot' | 'forgot-sent'>('form')

  useEffect(() => {
    setView(initialView)
  }, [initialView])

  useEffect(() => {
    if (!isModal || !onClose) return
    const onKey = (ev: globalThis.KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isModal, onClose])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [stay, setStay] = useState(() => isStaySignedIn())
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [busy, setBusy] = useState(false)

  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotBusy, setForgotBusy] = useState(false)

  const pwOk = password.length >= MIN_PASSWORD
  const confirmOk = confirm !== '' && confirm === password
  const isNameEmail = isEmailAddress(name)
  const canSubmit =
    view === 'signin'
      ? email.trim() !== '' && password !== ''
      : email.trim() !== '' && name.trim() !== '' && !isNameEmail && pwOk && confirmOk

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (busy || !canSubmit) return
    setBusy(true)
    dismissSignedOutNotice()
    try {
      if (view === 'signin') {
        await signIn(email.trim(), password)
      } else {
        sessionStorage.setItem('gahm_just_signed_up', 'true')
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
    clearError()
    dismissSignedOutNotice()
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

  const demoCard = (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-1 text-sm font-bold text-neutral-900">{t('auth.tryDemo')}</div>
      <p className="mb-2 text-xs leading-relaxed text-neutral-600">{t('auth.demoHint')}</p>
      <p className="mb-3 font-mono text-xs text-neutral-500">
        {DEMO_EMAIL} / {DEMO_PASSWORD}
      </p>
      <button
        type="button"
        onClick={() => void enterDemo()}
        disabled={busy}
        className="w-full rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('auth.demoButton')}
      </button>
    </div>
  )

  const errorBox = errorText ? (
    <div
      role="alert"
      className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700"
    >
      {errorText === UNREACHABLE_MESSAGE ? t('auth.unreachable') : errorText}
    </div>
  ) : null

  const content = (
    <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-[#E8E2D5] bg-[#FDFBF7] p-5 shadow-2xl sm:p-7">
      {isModal && onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('auth.closeAuthAria')}
          className="absolute right-4 top-4 rounded-md p-1.5 text-neutral-400 hover:bg-[#F6F2EA] hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]"
        >
          ✕
        </button>
      ) : null}
      <BrandLockup />

        {signedOutNotice ? (
          <div
            role="status"
            className="mb-4 rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-xs text-neutral-600"
          >
            {t('auth.signedOutNotice')}
          </div>
        ) : null}

        {step === 'forgot' || step === 'forgot-sent' ? (
          <>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">{t('auth.resetTitle')}</h1>
            <p className="mb-6 mt-1 text-sm leading-relaxed text-neutral-600">
              {step === 'forgot' ? t('auth.resetSub') : t('auth.resetSent', { email: forgotEmail })}
            </p>

            {step === 'forgot' ? (
              <form onSubmit={submitForgot} className="space-y-4">
                <div>
                  <label htmlFor="auth-forgot-email" className={labelCls}>
                    {t('auth.email')}
                  </label>
                  <input
                    id="auth-forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
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
                  {forgotBusy ? t('auth.sending') : t('auth.sendResetLink')}
                </button>
              </form>
            ) : (
              <div className="mb-4 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs leading-relaxed text-neutral-600">
                {t('auth.resetNote')}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setStep('form')
                clearError()
              }}
              className="mt-4 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              {t('auth.backToSignin')}
            </button>
            {demoCard}
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {view === 'signin' ? t('auth.welcomeBack') : t('auth.createAccountTitle')}
            </h1>
            <p className="mb-6 mt-1 text-sm leading-relaxed text-neutral-600">
              {view === 'signin' ? t('auth.signinSub') : t('auth.signupSub')}
            </p>

            <div className="mb-5 flex rounded-md bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setView('signin')
                  dismissSignedOutNotice()
                  clearError()
                }}
                disabled={busy}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  view === 'signin'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {t('auth.tabSignin')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('signup')
                  dismissSignedOutNotice()
                  clearError()
                }}
                disabled={busy}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  view === 'signup'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {t('auth.tabSignup')}
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {view === 'signup' ? (
                <div>
                  <label htmlFor="auth-name" className={labelCls}>
                    {t('auth.profileName')}
                  </label>
                  <input
                    id="auth-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.profileNamePlaceholder')}
                    autoComplete="name"
                    className={inputCls}
                  />
                  {name.trim() !== '' && isNameEmail ? (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {t('auth.profileNameEmailError')}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-neutral-500">{t('auth.profileNameHint')}</p>
                  )}
                </div>
              ) : null}

              <div>
                <label htmlFor="auth-email" className={labelCls}>
                  {t('auth.email')}
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="auth-password" className={labelCls}>
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onKeyDownPassword}
                    placeholder="••••••••"
                    autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? t('common.hide') : t('common.show')}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  >
                    {showPw ? t('common.hide') : t('common.show')}
                  </button>
                </div>
                {view === 'signup' ? (
                  password === '' ? (
                    <p className="mt-1 text-xs text-neutral-500">
                      {t('auth.minChars', { n: MIN_PASSWORD })}
                    </p>
                  ) : !pwOk ? (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {t('auth.pwTooShort', { n: MIN_PASSWORD, len: password.length })}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs font-semibold text-emerald-600">{t('auth.pwOk')}</p>
                  )
                ) : null}
                {capsLock ? (
                  <p className="mt-1 text-xs text-amber-600">{t('auth.capsLock')}</p>
                ) : null}
              </div>

              {view === 'signup' ? (
                <div>
                  <label htmlFor="auth-confirm" className={labelCls}>
                    {t('auth.confirmPassword')}
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
                      aria-label={showConfirm ? t('common.hide') : t('common.show')}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      {showConfirm ? t('common.hide') : t('common.show')}
                    </button>
                  </div>
                  {confirm !== '' && !confirmOk ? (
                    <p className="mt-1 text-xs text-red-600">{t('auth.pwMismatch')}</p>
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
                  {t('auth.staySignedIn')}
                </label>
                {view === 'signin' ? (
                  <button
                    type="button"
                    onClick={openForgot}
                    className="text-xs font-semibold text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  >
                    {t('auth.forgotPassword')}
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
                    ? t('auth.signingIn')
                    : t('auth.creatingAccount')
                  : view === 'signin'
                    ? t('auth.signInSubmit')
                    : t('auth.createAccountSubmit')}
              </button>
            </form>

            {view === 'signin' ? demoCard : null}
          </>
        )}

        <p className="mt-6 text-center text-xs leading-relaxed text-neutral-400">
          {view === 'signin' ? t('auth.privacySignin') : t('auth.privacySignup')}
        </p>

        <div className="mt-4 flex justify-center">
          <LanguageSwitcher variant="card" />
        </div>
      </div>
  )

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose()
        }}
      >
        {content}
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center overflow-hidden bg-neutral-900 p-4">
      {content}
      {onBackToLanding ? (
        <button
          type="button"
          onClick={onBackToLanding}
          className="mt-3 rounded-md px-3 py-2 text-xs font-semibold text-neutral-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          ← {t('auth.backToLanding')}
        </button>
      ) : null}
    </div>
  )
}

export default AuthView