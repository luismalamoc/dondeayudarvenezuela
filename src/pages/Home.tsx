import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, HandHeart } from 'lucide-react'
import EntryCard from '../components/EntryCard'
import FilterBar from '../components/FilterBar'
import LangToggle from '../components/LangToggle'
import SubmitForm from '../components/SubmitForm'
import { getEntries } from '../lib/api'
import { filterEntries } from '../lib/entries'
import type { Dictionary } from '../i18n/types'
import type { Entry, Filters, Lang } from '../types'

interface HomeProps {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Dictionary
}

export default function Home({ lang, setLang, t }: HomeProps) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<Filters>({ type: 'all', method: 'all', currency: 'all' })

  useEffect(() => {
    let isMounted = true
    getEntries()
      .then((data) => {
        if (isMounted) setEntries(data.entradas)
      })
      .catch((apiError: unknown) => {
        if (isMounted) setError(apiError instanceof Error ? apiError.message : 'Error')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredEntries = useMemo(() => filterEntries(entries, filters), [entries, filters])

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3 text-lg font-black text-[#071a3d]">
            <span className="grid size-10 place-items-center rounded-md bg-[#ffdf42] text-[#071a3d]">
              <HandHeart size={22} aria-hidden="true" />
            </span>
            {t.nav.title}
          </a>
          <nav className="flex items-center gap-3">
            <a href="/acerca" className="rounded-md px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
              {t.nav.about}
            </a>
            <LangToggle lang={lang} setLang={setLang} />
          </nav>
        </div>
        <div className="border-t border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-6xl gap-3 px-4 py-3 text-sm font-semibold leading-6 text-amber-950 sm:px-6 lg:px-8">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
            <p>{t.disclaimer}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#b71c1c]">{t.hero.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-[#071a3d] sm:text-5xl">
              {t.hero.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{t.hero.body}</p>
            <a
              href="#solicitar"
              className="mt-6 inline-flex rounded-md bg-[#ffdf42] px-5 py-3 font-black text-[#071a3d] hover:bg-[#ffd51a]"
            >
              {t.hero.submit}
            </a>
          </div>
          <div className="rounded-lg border border-slate-200 bg-[#071a3d] p-5 text-white">
            <div className="grid gap-3 text-sm font-semibold">
              <div className="rounded-md bg-white/10 p-4">Venezuela</div>
              <div className="rounded-md bg-[#ffdf42] p-4 text-[#071a3d]">Ayuda directa</div>
              <div className="rounded-md bg-[#b71c1c] p-4">24 junio 2026</div>
            </div>
          </div>
        </section>

        <FilterBar filters={filters} setFilters={setFilters} t={t} />

        {loading ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600">{t.loading}</p> : null}
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-5 font-semibold text-red-800">{error}</p>
        ) : null}

        <section className="grid gap-5">
          {filteredEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} lang={lang} t={t} />
          ))}
        </section>

        <SubmitForm t={t} lang={lang} />
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span>Hecho con amor ❤️ y con IA 🤣</span>
          <a href="https://instagram.com/luismalamoc" target="_blank" rel="noreferrer" className="hover:text-slate-800">
            @luismalamoc
          </a>
          <a href="mailto:luismalamoc@gmail.com" className="hover:text-slate-800">
            luismalamoc@gmail.com
          </a>
          <a href="https://github.com/luismalamoc" target="_blank" rel="noreferrer" className="hover:text-slate-800">
            GitHub
          </a>
          <a href="/acerca" className="hover:text-slate-800">
            {t.nav.about}
          </a>
        </div>
      </footer>
    </div>
  )
}
