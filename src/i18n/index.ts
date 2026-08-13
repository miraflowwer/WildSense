import { enRaw, type Catalog, type TKey } from './catalog-en'
import { kn } from './catalog-kn'
import { ta } from './catalog-ta'

export type Lang = 'en' | 'kn' | 'ta'

export const LANGS: Lang[] = ['en', 'kn', 'ta']

export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  kn: 'ಕನ್ನಡ',
  ta: 'தமிழ்',
}

export const LOCALE_IDS: Record<Lang, string> = {
  en: 'en-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
}

const LANG_KEY = 'gahm.lang'

export function readSavedLang(): Lang {
  try {
    const raw = localStorage.getItem(LANG_KEY)
    if (raw === 'en' || raw === 'kn' || raw === 'ta') return raw
  } catch {
    /* storage blocked — default to English */
  }
  return 'en'
}

export function saveLangToStorage(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    /* storage blocked — best-effort */
  }
}

export const CATALOGS: Record<Lang, Catalog> = { en: enRaw, kn, ta }

export type { TKey }

export function translate(catalog: Catalog, key: TKey, params?: Record<string, string | number>): string {
  const raw = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, catalog as unknown as Record<string, unknown>)
  if (typeof raw !== 'string') return key
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (match, p: string) =>
    params[p] != null ? String(params[p]) : match,
  )
}