import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { DEMO_EMAIL, isDemoCredentials } from './demoAccount'
import { clearStaySignedIn, isRememberedSessionExpired, isStaySignedIn } from './storage'

export type AuthMode = 'demo' | 'user'

export interface AuthUser {
  email: string
  name: string
}

export interface AuthContextValue {
  mode: AuthMode | null
  user: AuthUser | null
  serverReachable: boolean
  isBooting: boolean
  errorText: string | null
  pendingVerification: { email: string } | null
  passwordRecovery: boolean
  resendCountdown: number
  signedOutNotice: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendVerificationCode: (email: string) => Promise<void>
  resendCode: () => Promise<void>
  verifyCode: (email: string, token: string) => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<boolean>
  setNewPassword: (password: string) => Promise<boolean>
  dismissSignedOutNotice: () => void
}

const UNREACHABLE_MESSAGE = 'Server unreachable — check your connection and try again.'
const WRONG_CODE_MESSAGE = "That code didn't match — check the email and try again."
const DEMO_USER: AuthUser = { email: DEMO_EMAIL, name: 'Ranger Demo' }

function displayName(u: User): string {
  const full = u.user_metadata?.full_name
  if (typeof full === 'string' && full.trim() !== '') return full
  const local = (u.email ?? '').split('@')[0] ?? ''
  return local.trim() !== '' ? local : 'Ranger'
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [serverReachable, setServerReachable] = useState(true)
  const [isBooting, setIsBooting] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [pendingVerification, setPendingVerification] = useState<{ email: string } | null>(null)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [signedOutNotice, setSignedOutNotice] = useState(false)

  const mountedRef = useRef(true)
  const pendingRef = useRef<string | null>(null)
  const suppressAutoSendRef = useRef(false)

  const sendVerificationCode = useCallback(async (email: string) => {
    if (!supabase) return
    setErrorText(null)
    setResendCountdown(60)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (error) setErrorText(error.message)
  }, [])

  const applySession = useCallback(
    (session: Session | null) => {
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
      if (session.user.email_confirmed_at == null) {
        setMode(null)
        setUser(null)
        if (!pendingRef.current && !suppressAutoSendRef.current) {
          void sendVerificationCode(email)
          pendingRef.current = email
          setPendingVerification({ email })
        }
        return
      }
      setMode('user')
      setUser({
        email: session.user.email ?? session.user.id,
        name: displayName(session.user),
      })
    },
    [sendVerificationCode],
  )

  useEffect(() => {
    const db = supabase
    if (!db) {
      setIsBooting(false)
      return
    }
    mountedRef.current = true
    let mounted = true
    const boot = async () => {
      if (isStaySignedIn() && isRememberedSessionExpired()) {
        clearStaySignedIn()
        await db.auth.signOut()
      }
      const { data } = await db.auth.getSession()
      if (!mounted) return
      setIsBooting(false)
      applySession(data.session)
    }
    void boot()
    const { data: listener } = db.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true)
        pendingRef.current = null
        setPendingVerification(null)
        setMode(null)
        setUser(null)
        return
      }
      applySession(session)
    })
    return () => {
      mounted = false
      mountedRef.current = false
      listener.subscription.unsubscribe()
    }
  }, [applySession])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const id = window.setInterval(() => setResendCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => window.clearInterval(id)
  }, [resendCountdown])

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
    suppressAutoSendRef.current = true
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    suppressAutoSendRef.current = false
    if (error) {
      if (isDemoCredentials(email, password)) {
        setMode('demo')
        setUser(DEMO_USER)
        setServerReachable(false)
        return
      }
      setErrorText(error.message)
      return
    }
    setServerReachable(true)
    if (data.user?.email_confirmed_at == null) {
      await supabase.auth.signOut()
      await sendVerificationCode(email)
      pendingRef.current = email
      setPendingVerification({ email })
    }
  }, [sendVerificationCode])

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      setErrorText(null)
      if (!supabase) {
        setErrorText(UNREACHABLE_MESSAGE)
        return
      }
      suppressAutoSendRef.current = true
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      suppressAutoSendRef.current = false
      if (error) {
        setErrorText(error.message)
        return
      }
      await supabase.auth.signOut()
      pendingRef.current = email
      setPendingVerification({ email })
      await sendVerificationCode(email)
    },
    [sendVerificationCode],
  )

  const signOut = useCallback(async () => {
    setErrorText(null)
    setMode(null)
    setUser(null)
    clearStaySignedIn()
    pendingRef.current = null
    setPendingVerification(null)
    setPasswordRecovery(false)
    setSignedOutNotice(true)
    if (supabase) await supabase.auth.signOut()
  }, [])

  const resendCode = useCallback(async () => {
    if (!pendingRef.current) return
    await sendVerificationCode(pendingRef.current)
  }, [sendVerificationCode])

  const verifyCode = useCallback(
    async (email: string, token: string) => {
      if (!supabase) {
        setErrorText(UNREACHABLE_MESSAGE)
        return false
      }
      setErrorText(null)
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (error) {
        setErrorText(WRONG_CODE_MESSAGE)
        return false
      }
      pendingRef.current = null
      setPendingVerification(null)
      if (data.session) applySession(data.session)
      return true
    },
    [applySession],
  )

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
      setErrorText(error.message)
      return false
    }
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
      setErrorText(error.message)
      return false
    }
    setPasswordRecovery(false)
    return true
  }, [])

  const dismissSignedOutNotice = useCallback(() => setSignedOutNotice(false), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      mode,
      user,
      serverReachable,
      isBooting,
      errorText,
      pendingVerification,
      passwordRecovery,
      resendCountdown,
      signedOutNotice,
      signUp,
      signIn,
      signOut,
      sendVerificationCode,
      resendCode,
      verifyCode,
      requestPasswordReset,
      setNewPassword,
      dismissSignedOutNotice,
    }),
    [
      mode,
      user,
      serverReachable,
      isBooting,
      errorText,
      pendingVerification,
      passwordRecovery,
      resendCountdown,
      signedOutNotice,
      signUp,
      signIn,
      signOut,
      sendVerificationCode,
      resendCode,
      verifyCode,
      requestPasswordReset,
      setNewPassword,
      dismissSignedOutNotice,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}