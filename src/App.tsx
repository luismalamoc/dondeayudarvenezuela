import { useEffect, useMemo, useState } from 'react'
import Admin from './pages/Admin'
import Home from './pages/Home'
import { dictionaries } from './i18n'
import type { Lang } from './types'

function getInitialLang(): Lang {
  if (window.location.pathname === '/en') return 'en'
  const savedLang = window.localStorage.getItem('ayuda-venezuela-lang')
  if (savedLang === 'en' || savedLang === 'es') return savedLang
  return 'es'
}

export default function App() {
  const [lang, setLangState] = useState<Lang>(getInitialLang)
  const isAdmin = window.location.pathname.startsWith('/admin')
  const t = useMemo(() => dictionaries[lang], [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.meta.title
  }, [lang, t])

  function setLang(nextLang: Lang) {
    setLangState(nextLang)
    window.localStorage.setItem('ayuda-venezuela-lang', nextLang)
    if (!isAdmin) {
      window.history.replaceState({}, '', nextLang === 'en' ? '/en' : '/')
    }
  }

  return isAdmin ? (
    <Admin lang={lang} setLang={setLang} t={t} />
  ) : (
    <Home lang={lang} setLang={setLang} t={t} />
  )
}
