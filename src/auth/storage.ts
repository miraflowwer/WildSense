import type { SupportedStorage } from '@supabase/supabase-js'

const STAY_SIGNED_IN_KEY = 'gahm.stay_signed_in'
const STAY_SIGNED_IN_AT_KEY = 'gahm.stay_signed_in_at'
export const REMEMBER_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage blocked — flag is best-effort */
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export function isStaySignedIn(): boolean {
  return safeGet(STAY_SIGNED_IN_KEY) === '1'
}

export function setStaySignedIn(stay: boolean): void {
  if (stay) {
    safeSet(STAY_SIGNED_IN_KEY, '1')
    safeSet(STAY_SIGNED_IN_AT_KEY, String(Date.now()))
  } else {
    safeRemove(STAY_SIGNED_IN_KEY)
    safeRemove(STAY_SIGNED_IN_AT_KEY)
  }
}

export function clearStaySignedIn(): void {
  safeRemove(STAY_SIGNED_IN_KEY)
  safeRemove(STAY_SIGNED_IN_AT_KEY)
}

export function isRememberedSessionExpired(): boolean {
  const at = safeGet(STAY_SIGNED_IN_AT_KEY)
  if (!at) return false
  const t = Number(at)
  if (!Number.isFinite(t) || t <= 0) return false
  return Date.now() - t > REMEMBER_DAYS * DAY_MS
}

function targetStore(): Storage {
  return isStaySignedIn() ? localStorage : sessionStorage
}

export const authStorage: SupportedStorage = {
  getItem: (key) => targetStore().getItem(key),
  setItem: (key, value) => {
    targetStore().setItem(key, value)
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}