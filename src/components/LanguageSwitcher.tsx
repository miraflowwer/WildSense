import { LANGS, LANG_NAMES, useI18n } from '../i18n/I18nContext'

const baseBtn =
  'min-h-[36px] rounded-md px-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40'

export default function LanguageSwitcher({ variant = 'card' }: { variant?: 'card' | 'header' }) {
  const { lang, setLang, t } = useI18n()

  const activeCls =
    variant === 'header'
      ? 'bg-emerald-600 text-white'
      : 'bg-white text-neutral-900 shadow-sm ring-1 ring-emerald-600/40'
  const idleCls =
    variant === 'header'
      ? 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
      : 'text-neutral-500 hover:bg-[#F6F2EA] hover:text-neutral-700'
  const groupCls =
    variant === 'header'
      ? 'flex items-center gap-0.5 rounded-md border border-neutral-700 bg-neutral-900 p-0.5'
      : 'flex rounded-md bg-neutral-100 p-1'

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={groupCls}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`${baseBtn} ${lang === l ? activeCls : idleCls}`}
        >
          {LANG_NAMES[l]}
        </button>
      ))}
    </div>
  )
}