import { HandHeart } from 'lucide-react'
import LangToggle from '../components/LangToggle'
import type { Dictionary } from '../i18n/types'
import type { Lang } from '../types'

interface AboutProps {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Dictionary
}

const content = {
  es: {
    title: '¿Por qué existe este sitio?',
    body: [
      'Después del terremoto del 24 de junio de 2026 en Venezuela, las redes sociales se inundaron de información dispersa: cuentas bancarias en stories que expiran en 24 horas, hilos de Twitter imposibles de rastrear, grupos de WhatsApp con datos ya desactualizados. Querer ayudar y no saber exactamente cómo ni a quién se convirtió en una frustración real.',
      'Este directorio nació para resolver eso.',
      'Un solo lugar, verificado y actualizado, con las personas y organizaciones que están recibiendo donaciones de verdad. Sin ruido. Sin datos sin fuente. Solo iniciativas con al menos un enlace oficial —Instagram, sitio web, o campaña de recaudación— que permita verificar antes de transferir.',
      'No recibo ni muevo dinero. No soy una ONG ni una organización formal. Soy una persona que vio el caos informativo y decidió hacer algo concreto.',
      'Si conoces a alguien que debería estar aquí, usa el formulario de solicitud en la página principal. Si encontraste un dato incorrecto o quieres contactarme, escríbeme directamente.',
    ],
    cta: 'Volver al directorio',
  },
  en: {
    title: 'Why does this site exist?',
    body: [
      'After the earthquake of June 24, 2026 in Venezuela, social media filled with scattered information: bank accounts in Stories that expire in 24 hours, Twitter threads impossible to track, WhatsApp groups with already-outdated data. Wanting to help and not knowing exactly how or to whom became a real frustration.',
      'This directory was created to solve that.',
      'One place, verified and up to date, with the people and organizations genuinely receiving donations. No noise. No unsourced data. Only initiatives with at least one official link — Instagram, website, or fundraising campaign — that allows verification before transferring.',
      "I don't receive or move money. I'm not an NGO or a formal organization. I'm a person who saw the information chaos and decided to do something concrete.",
      'If you know someone who should be here, use the request form on the main page. If you found an error or want to contact me, write to me directly.',
    ],
    cta: 'Back to directory',
  },
}

export default function About({ lang, setLang, t }: AboutProps) {
  const c = content[lang]

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
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-[#071a3d]">{c.title}</h1>

        <div className="mt-8 space-y-5">
          {c.body.map((paragraph, index) => (
            <p
              key={index}
              className={`text-base leading-7 ${index === 1 ? 'font-bold text-[#071a3d]' : 'text-slate-600'}`}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-[#071a3d] px-5 py-3 font-black text-white hover:bg-[#0d2a61]"
          >
            {c.cta}
          </a>
          <a
            href="https://instagram.com/luismalamoc"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-100"
          >
            @luismalamoc
          </a>
        </div>
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
        </div>
      </footer>
    </div>
  )
}
