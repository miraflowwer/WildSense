import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { DEMO_EMAIL, isDemoCredentials } from './demoAccount'

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
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const UNREACHABLE_MESSAGE = 'Server unreachable — check your connection and try again.'
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

  useEffect(() => {
    if (!supabase) {
      setIsBooting(false)
      return
    }
    let mounted = true
    const applySession = (session: Session | null) => {
      if (!mounted) return
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
    }
    void supabase.auth.getSession().then(({ data }) => {
      setIsBooting(false)
      applySession(data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

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
        setServerReachable(false)
        return
      }
      setErrorText(error.message)
      return
    }
    setServerReachable(true)
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setErrorText(null)
    if (!supabase) {
      setErrorText(UNREACHABLE_MESSAGE)
      return
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) setErrorText(error.message)
  }, [])

  const signOut = useCallback(async () => {
    setErrorText(null)
    setMode(null)
    setUser(null)
    if (supabase) await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ mode, user, serverReachable, isBooting, errorText, signUp, signIn, signOut }),
    [mode, user, serverReachable, isBooting, errorText, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}