import type { ComponentType } from 'react'
import {
  AtSign,
  Building2,
  CreditCard,
  DollarSign,
  ExternalLink,
  Globe2,
  Landmark,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Star,
  User,
  Wallet,
  X as XIcon,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { Dictionary } from '../i18n/types'
import type { ContactMethod, ContactMethodType, Entry, Lang, MethodType, PaymentMethod } from '../types'
import { entryDescription, groupMethods } from '../lib/entries'

interface EntryCardProps {
  entry: Entry
  lang: Lang
  t: Dictionary
}

const paymentIcons: Record<MethodType, ComponentType<LucideProps>> = {
  banco_ve: Landmark,
  banco_us: Landmark,
  banco_cl: Landmark,
  paypal: DollarSign,
  zelle: Mail,
  binance: Wallet,
  venmo: Wallet,
  pago_movil: Smartphone,
  donorbox: CreditCard,
  globalgiving: Globe2,
  gofundme: Globe2,
  otro: Wallet,
}

const contactIcons: Record<ContactMethodType, ComponentType<LucideProps>> = {
  whatsapp: MessageCircle,
  instagram: AtSign,
  x: XIcon,
  web: Globe2,
}

function whatsappHref(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '')
  return `https://wa.me/${digits}`
}

function contactHref(contact: ContactMethod): string {
  const { tipo, detalle } = contact
  if (tipo === 'whatsapp') return whatsappHref(detalle)
  if (detalle.startsWith('http')) return detalle
  const handle = detalle.startsWith('@') ? detalle.slice(1) : detalle
  if (tipo === 'instagram') return `https://instagram.com/${handle}`
  if (tipo === 'x') return `https://x.com/${handle}`
  return detalle
}

function ContactMethodItem({ contact }: { contact: ContactMethod }) {
  const Icon = contactIcons[contact.tipo as ContactMethodType] ?? Globe2
  const href = contactHref(contact)
  const isLink = href.startsWith('http')

  return (
    <li className="flex items-start gap-2 text-sm text-slate-700">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
      <span>
        {contact.label ? <span className="font-semibold">{contact.label}: </span> : null}
        {isLink ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="break-all text-[#071a3d] underline underline-offset-2 hover:text-[#0d2a61]"
          >
            {contact.detalle}
          </a>
        ) : (
          <span className="break-all">{contact.detalle}</span>
        )}
      </span>
    </li>
  )
}

export default function EntryCard({ entry, lang, t }: EntryCardProps) {
  const TypeIcon = entry.tipo === 'persona' ? User : Building2
  const description = entryDescription(entry, lang)
  const groupedMethods = groupMethods(entry.metodos)
  const hasContactos = entry.contactos.length > 0
  const hasLocation = entry.estado_ve || entry.ciudad_ve

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#071a3d]">
              <TypeIcon size={14} aria-hidden="true" />
              {entry.tipo === 'persona' ? t.entry.persona : t.entry.organizacion}
            </span>
            {entry.destacado ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ffdf42]/30 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#5c4a00]">
                <Star size={14} aria-hidden="true" />
                {t.entry.featured}
              </span>
            ) : null}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950">{entry.nombre}</h2>
            {entry.campana ? (
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#071a3d]">
                <Megaphone size={15} aria-hidden="true" />
                <span>
                  <span className="uppercase tracking-wide text-slate-500">{t.entry.campaign}: </span>
                  {entry.campana}
                </span>
              </p>
            ) : null}
            {hasLocation ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin size={14} aria-hidden="true" />
                {[entry.ciudad_ve, entry.estado_ve].filter(Boolean).join(', ')}
              </p>
            ) : null}
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </div>

        {entry.verificacion_url && entry.verificacion_url.startsWith('http') ? (
          <a
            href={entry.verificacion_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-[#071a3d] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d2a61]"
          >
            <ShieldCheck size={16} aria-hidden="true" />
            {t.entry.verify}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        ) : entry.verificacion_url ? (
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600">
            <ShieldCheck size={16} aria-hidden="true" />
            {entry.verificacion_url}
          </span>
        ) : null}
      </div>

      {hasContactos ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t.entry.contact}</h3>
          <ul className="mt-2 space-y-1.5">
            {entry.contactos.map((contact) => (
              <ContactMethodItem key={contact.id} contact={contact} />
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 border-t border-slate-200 pt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t.entry.methods}</h3>
        {groupedMethods.size === 0 ? (
          <p className="mt-3 text-sm text-slate-500">{t.entry.noMethods}</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {[...groupedMethods.entries()].map(([type, methods]) => {
              const Icon = paymentIcons[type] ?? Wallet
              return (
                <div key={type} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Icon size={17} aria-hidden="true" />
                    {t.methodLabels[type] ?? type}
                  </div>
                  <ul className="space-y-2">
                    {methods.map((method: PaymentMethod) => (
                      <li key={method.id} className="text-sm leading-5 text-slate-700">
                        <span className="block break-words">{method.detalle}</span>
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          {[method.pais, method.moneda].filter(Boolean).join(' / ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
        {t.disclaimer}
      </p>
    </article>
  )
}
