import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { isAuthApiError, type Session, type User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { DEMO_EMAIL, isDemoCredentials } from './demoAccount'
import { clearStaySignedIn, isRememberedSessionExpired, isStaySignedIn } from './storage'
import {
  AuthContext,
  type AuthContextValue,
  type AuthMode,
  type AuthUser,
} from './authContext'

export const UNREACHABLE_MESSAGE = 'Server unreachable — check your connection and try again.'
const SESSION_VALIDATION_TIMEOUT_MS = 8000
const DEMO_USER: AuthUser = { email: DEMO_EMAIL, name: 'Ranger Demo' }

function isEmailAddress(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
}

function displayName(u: User): string {
  const full = u.user_metadata?.full_name
  if (typeof full === 'string' && full.trim() !== '' && !isEmailAddress(full)) return full.trim()
  const local = (u.email ?? '').split('@')[0] ?? ''
  return local.trim() !== '' ? local : 'Ranger'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [serverReachable, setServerReachable] = useState(true)
  const [isBooting, setIsBooting] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [signedOutNotice, setSignedOutNotice] = useState(false)

  const mountedRef = useRef(true)
  const userInitiatedSignOutRef = useRef(false)

  const applySession = useCallback((session: Session | null) => {
    if (!mountedRef.current) return
    if (!session) {
      setMode(null)
      setUser(null)
      return
    }
    const email = (session.user.email ?? '').trim().toLowerCase()
    if (email === DEMO_EMAIL) {
      setMode('demo')
      setUser(DEMO_USER)
      return
    }
    setMode('user')
    setUser({
      email: session.user.email ?? session.user.id,
      name: displayName(session.user),
    })
  }, [])

  useEffect(() => {
    const db = supabase
    if (!db) {
      setServerReachable(false)
      setIsBooting(false)
      return
    }
    mountedRef.current = true
    let mounted = true
    const boot = async () => {
      if (isStaySignedIn() && isRememberedSessionExpired()) {
        clearStaySignedIn()
        userInitiatedSignOutRef.current = true
        try {
          await db.auth.signOut()
        } finally {
          userInitiatedSignOutRef.current = false
        }
      }
      const { data, error: sessionError } = await db.auth.getSession()
      if (!mounted) return
      if (sessionError && !isAuthApiError(sessionError)) {
        setServerReachable(false)
      } else {
        setServerReachable(true)
      }
      if (data?.session) {
        let sessionRejected = false
        let timer: number | undefined
        try {
          const timeout = new Promise<never>((_, reject) => {
            timer = window.setTimeout(
              () => reject(new Error('Session validation timed out')),
              SESSION_VALIDATION_TIMEOUT_MS,
            )
          })
          const { error } = await Promise.race([db.auth.getUser(), timeout])
          sessionRejected = !!error && isAuthApiError(error)
          if (error && !isAuthApiError(error)) {
            setServerReachable(false)
          }
        } catch {
          sessionRejected = false
        } finally {
          if (timer != null) window.clearTimeout(timer)
        }
        if (!mounted) return
        if (sessionRejected) {
          userInitiatedSignOutRef.current = true
          try {
            clearStaySignedIn()
            void db.auth.signOut()
            setMode(null)
            setUser(null)
            setSignedOutNotice(true)
          } finally {
            userInitiatedSignOutRef.current = false
          }
          setIsBooting(false)
          return
        }
      }
      setIsBooting(false)
      applySession(data?.session ?? null)
    }
    void boot()
    const { data: listener } = db.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setErrorText(null)
        setPasswordRecovery(true)
        setMode(null)
        setUser(null)
        return
      }
      if (event === 'SIGNED_OUT' && !userInitiatedSignOutRef.current) {
        setSignedOutNotice(true)
      }
      applySession(session)
    })
    return () => {
      mounted = false
      mountedRef.current = false
      listener.subscription.unsubscribe()
    }
  }, [applySession])

  const signIn = useCallback(async (email: string, password: string) => {
    setErrorText(null)
    if (!supabase) {
      if (isDemoCredentials(email, password)) {
        setMode('demo')
        setUser(DEMO_USER)
        setServerReachable(false)
        return
      }
      setErrorText(UNREACHABLE_MESSAGE)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (isDemoCredentials(email, password)) {
        setMode('demo')
        setUser(DEMO_USER)
        setServerReachable(isAuthApiError(error))
        return
      }
      if (!isAuthApiError(error)) {
        setServerReachable(false)
        setErrorText(UNREACHABLE_MESSAGE)
      } else {
        setServerReachable(true)
        setErrorText(error.message)
      }
      return
    }
    setServerReachable(true)
    // The session flows in via onAuthStateChange → applySession.
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setErrorText(null)
    if (!supabase) {
      setErrorText(UNREACHABLE_MESSAGE)
      return
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      if (!isAuthApiError(error)) {
        setServerReachable(false)
        setErrorText(UNREACHABLE_MESSAGE)
      } else {
        setServerReachable(true)
        setErrorText(error.message)
      }
      return
    }
    setServerReachable(true)
    // Email confirmation is removed: with "Confirm email" OFF in the dashboard,
    // signUp returns a session and the SIGNED_IN event signs the user in.
    if (!data.session) {
      setErrorText('Sign-up did not complete — "Confirm email" must be OFF in the Supabase dashboard.')
      return
    }
  }, [])

  const signOut = useCallback(async () => {
    setErrorText(null)
    setMode(null)
    setUser(null)
    clearStaySignedIn()
    setPasswordRecovery(false)
    setSignedOutNotice(true)
    userInitiatedSignOutRef.current = true
    try {
      if (supabase) await supabase.auth.signOut()
    } finally {
      userInitiatedSignOutRef.current = false
    }
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    setErrorText(null)
    if (!supabase) {
      setErrorText(UNREACHABLE_MESSAGE)
      return false
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) {
      if (!isAuthApiError(error)) {
        setServerReachable(false)
        setErrorText(UNREACHABLE_MESSAGE)
      } else {
        setServerReachable(true)
        setErrorText(error.message)
      }
      return false
    }
    setServerReachable(true)
    setSignedOutNotice(false)
    return true
  }, [])

  const setNewPassword = useCallback(async (password: string) => {
    setErrorText(null)
    if (!supabase) {
      setErrorText(UNREACHABLE_MESSAGE)
      return false
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      if (!isAuthApiError(error)) {
        setServerReachable(false)
        setErrorText(UNREACHABLE_MESSAGE)
      } else {
        setServerReachable(true)
        setErrorText(error.message)
      }
      return false
    }
    setServerReachable(true)
    setPasswordRecovery(false)
    return true
  }, [])

  const dismissSignedOutNotice = useCallback(() => setSignedOutNotice(false), [])
  const clearError = useCallback(() => setErrorText(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      mode,
      user,
      serverReachable,
      isBooting,
      errorText,
      passwordRecovery,
      signedOutNotice,
      signUp,
      signIn,
      signOut,
      requestPasswordReset,
      setNewPassword,
      dismissSignedOutNotice,
      clearError,
    }),
    [
      mode,
      user,
      serverReachable,
      isBooting,
      errorText,
      passwordRecovery,
      signedOutNotice,
      signUp,
      signIn,
      signOut,
      requestPasswordReset,
      setNewPassword,
      dismissSignedOutNotice,
      clearError,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
