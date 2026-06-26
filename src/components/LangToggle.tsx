import type { Lang } from '../types'

interface LangToggleProps {
  lang: Lang
  setLang: (lang: Lang) => void
}

const langs: Lang[] = ['es', 'en']

export default function LangToggle({ lang, setLang }: LangToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-slate-300 bg-white p-1 shadow-sm" aria-label="Language">
      {langs.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
            lang === option ? 'bg-[#071a3d] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
