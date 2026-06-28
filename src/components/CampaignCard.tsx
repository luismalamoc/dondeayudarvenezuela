import { useState } from 'react'
import { PAISES } from '../lib/venezuela'
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

const tipoLabel: Record<string, string> = {
  persona: 'Persona',
  organizacion: 'Organización',
}

const tipoStyle: Record<string, string> = {
  persona: 'bg-blue-50 text-blue-800 border-blue-200',
  organizacion: 'bg-violet-50 text-violet-800 border-violet-200',
}

const SHARE_PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', style: 'bg-[#25D366] hover:bg-[#1ebe5d] text-white' },
  { id: 'twitter', label: 'X', style: 'bg-black hover:bg-neutral-800 text-white' },
  { id: 'threads', label: 'Threads', style: 'bg-neutral-800 hover:bg-neutral-700 text-white' },
  { id: 'facebook', label: 'Facebook', style: 'bg-[#1877F2] hover:bg-blue-700 text-white' },
  { id: 'instagram', label: 'Instagram', style: 'bg-pink-500 hover:bg-pink-600 text-white' },
]

const INFO_LIMIT = 280

export default function CampaignCard({ pub }: { pub: Publicacion }) {
  const [expanded, setExpanded] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)

  const isLong = pub.info.length > INFO_LIMIT
  const displayInfo = isLong && !expanded ? pub.info.slice(0, INFO_LIMIT).trimEnd() + '…' : pub.info

  const date = new Date(pub.creado_en + 'Z').toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const shareText = `${pub.titulo}\n\n${pub.info}\n\ndondeayudarvenezuela.com`

  function markCopied(platform: string) {
    setCopiedPlatform(platform)
    setTimeout(() => setCopiedPlatform(null), 3000)
  }

  function handleShare(platform: string) {
    const enc = encodeURIComponent
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${enc(shareText)}`, '_blank', 'noreferrer')
    } else if (platform === 'twitter') {
      // Twitter siempre cuenta URLs como 23 chars; reservamos 2 para \n\n antes de la URL
      const TWITTER_URL = 'https://dondeayudarvenezuela.com'
      const bodyLimit = 280 - 23 - 2
      const full = `${pub.titulo}\n\n${pub.info}`
      const body = full.length <= bodyLimit ? full : full.slice(0, bodyLimit - 1) + '…'
      window.open(`https://x.com/intent/post?text=${enc(body + '\n\n' + TWITTER_URL)}`, '_blank', 'noreferrer')
    } else if (platform === 'threads') {
      window.open(`https://threads.net/intent/post?text=${enc(shareText)}`, '_blank', 'noreferrer')
    } else if (platform === 'facebook') {
      // Facebook no acepta texto via URL — copiamos primero para que el usuario lo pegue
      navigator.clipboard.writeText(shareText).then(() => {
        markCopied('facebook')
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${enc('https://dondeayudarvenezuela.com')}`,
          '_blank',
          'noreferrer',
        )
      })
    } else if (platform === 'instagram') {
      // Copiamos el texto y abrimos la app para que el usuario pegue en una story
      navigator.clipboard.writeText(shareText).then(() => {
        markCopied('instagram')
        window.location.href = 'instagram://'
      })
    }
  }

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

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-semibold ${tipoStyle[pub.tipo] ?? ''}`}
        >
          {tipoLabel[pub.tipo] ?? pub.tipo}
        </span>
        {pub.pais ? (
          <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
            {PAISES.find((p) => p.code === pub.pais)?.name ?? pub.pais}
          </span>
        ) : null}
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

      {shareOpen ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {SHARE_PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleShare(p.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${p.style}`}
            >
              {p.id === 'instagram' && copiedPlatform === 'instagram'
                ? '¡Copiado! Pega en story'
                : p.id === 'facebook' && copiedPlatform === 'facebook'
                  ? '¡Texto copiado!'
                  : p.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">{date}</p>
        <button
          onClick={() => setShareOpen((s) => !s)}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600"
        >
          {shareOpen ? 'Cerrar' : 'Compartir'}
        </button>
      </div>
    </article>
  )
}
