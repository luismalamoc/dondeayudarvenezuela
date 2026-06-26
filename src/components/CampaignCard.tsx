import { useState } from 'react'
import type { Publicacion } from '../types'

function contactUrl(tipo: string, valor: string): string {
  const v = valor.trim()
  if (tipo === 'whatsapp') return `https://wa.me/${v.replace(/\D/g, '')}`
  if (tipo === 'instagram') return `https://instagram.com/${v.replace(/^@/, '')}`
  if (tipo === 'twitter_x') return `https://x.com/${v.replace(/^@/, '')}`
  return '#'
}

function contactLabel(tipo: string, valor: string): string {
  if (tipo === 'instagram' || tipo === 'twitter_x') return `@${valor.replace(/^@/, '')}`
  return valor
}

const contactStyle: Record<string, string> = {
  whatsapp: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  instagram: 'bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100',
  twitter_x: 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100',
}

const contactName: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  twitter_x: 'X',
}

const INFO_LIMIT = 280

export default function CampaignCard({ pub }: { pub: Publicacion }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = pub.info.length > INFO_LIMIT
  const displayInfo = isLong && !expanded ? pub.info.slice(0, INFO_LIMIT).trimEnd() + '…' : pub.info

  const date = new Date(pub.creado_en + 'Z').toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-[#071a3d]">{pub.titulo}</h2>

      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">{displayInfo}</pre>

      {isLong ? (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-sm font-bold text-[#071a3d] hover:underline"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      ) : null}

      {pub.contactos.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {pub.contactos.map((c) => (
            <a
              key={c.id}
              href={contactUrl(c.tipo, c.valor)}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-semibold ${contactStyle[c.tipo] ?? ''}`}
            >
              <span className="text-xs font-black">{contactName[c.tipo] ?? c.tipo}</span>
              {contactLabel(c.tipo, c.valor)}
            </a>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-slate-400">{date}</p>
    </article>
  )
}
