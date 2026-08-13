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
import { useAuth } from '../auth/authContext'
import { loadUserLanguage, saveUserLanguage } from '../auth/api'
import type { Catalog } from './catalog-en'
import {
  CATALOGS,
  LANG_NAMES,
  LOCALE_IDS,
  LANGS,
  readSavedLang,
  saveLangToStorage,
  translate,
  type Lang,
  type TKey,
} from './index'

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TKey, params?: Record<string, string | number>) => string
  catalog: Catalog
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const { mode, user } = useAuth()
  const [lang, setLangState] = useState<Lang>(readSavedLang)
  const syncedRef = useRef(false)
  const pickedRef = useRef(false)
  const authRef = useRef({ mode, user })
  authRef.current = { mode, user }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Per-account sync: a local pick wins on sign-in (writes through to the
  // account); with no local pick the account preference is loaded instead.
  useEffect(() => {
    if (mode !== 'user' || !user) {
      syncedRef.current = false
      return
    }
    if (syncedRef.current) return
    const saved = readSavedLang()
    if (saved !== 'en' || localStorage.getItem('gahm.lang') != null) {
      syncedRef.current = true
      void saveUserLanguage(saved).catch(() => {
        /* offline — local pick stands */
      })
      return
    }
    syncedRef.current = true
    loadUserLanguage()
      .then((accountLang) => {
        if (authRef.current.mode !== 'user' || !authRef.current.user) return
        if (pickedRef.current || readSavedLang() !== saved) return
        if (accountLang === 'en' || accountLang === 'kn' || accountLang === 'ta') {
          setLangState(accountLang)
        }
      })
      .catch(() => {
        /* offline — keep local default */
      })
  }, [mode, user])

  const setLang = useCallback(
    (next: Lang) => {
      pickedRef.current = true
      setLangState(next)
      saveLangToStorage(next)
      document.documentElement.lang = next
      if (mode === 'user' && user) {
        void saveUserLanguage(next).catch(() => {
          /* offline — local pick stands */
        })
      }
    },
    [mode, user],
  )

  const t = useCallback(
    (key: TKey, params?: Record<string, string | number>) =>
      translate(CATALOGS[lang], key, params),
    [lang],
  )

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t, catalog: CATALOGS[lang] }),
    [lang, setLang, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export { LANG_NAMES, LOCALE_IDS, LANGS }
export type { Lang, TKey }