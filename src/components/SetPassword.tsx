import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useAuth } from '../auth/authContext'
import { UNREACHABLE_MESSAGE } from '../auth/AuthProvider'
import { useI18n } from '../i18n/I18nContext'
import LanguageSwitcher from './LanguageSwitcher'

const MIN_PASSWORD = 8

const inputCls =
  'w-full rounded-md border border-neutral-300 px-3 py-2 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'
const labelCls = 'mb-1 block text-[11px] font-semibold uppercase tracking-widest text-neutral-700'

function SetPassword() {
  const { setNewPassword, errorText } = useAuth()
  const { t } = useI18n()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [busy, setBusy] = useState(false)

  const valid = password.length >= MIN_PASSWORD && confirm !== '' && confirm === password

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (busy || !valid) return
    setBusy(true)
    try {
      await setNewPassword(password)
    } finally {
      setBusy(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState?.('CapsLock') ?? false)
  }

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden bg-neutral-900 p-4">
      <div className="max-h-full w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <div className="mb-6">
          <div className="mb-1 text-3xl font-bold tracking-tight text-neutral-900">GAHM</div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            {t('app.brandTagline')}
          </div>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-neutral-900">{t('setPassword.title')}</h1>
        <p className="mb-6 mt-1 text-sm leading-relaxed text-neutral-600">
          {t('setPassword.sub')}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="reset-password" className={labelCls}>
              {t('setPassword.newPassword')}
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="••••••••"
                autoComplete="new-password"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? t('common.hide') : t('common.show')}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              >
                {show ? t('common.hide') : t('common.show')}
              </button>
            </div>
            {password === '' ? (
              <p className="mt-1 text-xs text-neutral-500">
                {t('auth.minChars', { n: MIN_PASSWORD })}
              </p>
            ) : password.length < MIN_PASSWORD ? (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {t('auth.pwTooShort', { n: MIN_PASSWORD, len: password.length })}
              </p>
            ) : (
              <p className="mt-1 text-xs font-semibold text-emerald-600">{t('auth.pwOk')}</p>
            )}
            {capsLock ? <p className="mt-1 text-xs text-amber-600">{t('auth.capsLock')}</p> : null}
          </div>

          <div>
            <label htmlFor="reset-confirm" className={labelCls}>
              {t('auth.confirmPassword')}
            </label>
            <input
              id="reset-confirm"
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="••••••••"
              autoComplete="new-password"
              className={inputCls}
            />
            {confirm !== '' && confirm !== password ? (
              <p className="mt-1 text-xs text-red-600">{t('auth.pwMismatch')}</p>
            ) : null}
          </div>

          {errorText ? (
            <div
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700"
            >
              {errorText === UNREACHABLE_MESSAGE ? t('auth.unreachable') : errorText}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!valid || busy}
            className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? t('setPassword.saving') : t('setPassword.saveNewPassword')}
          </button>
        </form>

        <div className="mt-4 flex justify-center">
          <LanguageSwitcher variant="card" />
        </div>
      </div>
    </div>
  )
}

export default SetPassword