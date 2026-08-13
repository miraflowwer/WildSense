import { createContext, useContext } from 'react'

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

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}