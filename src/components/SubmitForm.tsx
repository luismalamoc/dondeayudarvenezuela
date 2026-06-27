import { useCallback, useState } from 'react'
import { Send } from 'lucide-react'
import { submitRequest } from '../lib/api'
import Turnstile from './Turnstile'
import type { Dictionary } from '../i18n/types'
import type { EntryType, Lang, SolicitudDraft } from '../types'

interface SubmitFormProps {
  t: Dictionary
  lang: Lang
}

const initialForm: SolicitudDraft = {
  nombre: '',
  campana: '',
  tipo: 'persona',
  descripcion: '',
  verificacion_url: '',
  contacto: '',
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function SubmitForm({ t, lang }: SubmitFormProps) {
  const [form, setForm] = useState<SolicitudDraft>(initialForm)
  const [status, setStatus] = useState<Status>('idle')
  const [token, setToken] = useState('')

  function updateField<K extends keyof SolicitudDraft>(field: K, value: SolicitudDraft[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleVerify = useCallback((nextToken: string) => setToken(nextToken), [])
  const handleExpire = useCallback(() => setToken(''), [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    try {
      await submitRequest(form, token)
      setForm(initialForm)
      setToken('')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="solicitar" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-slate-950">{t.submit.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{t.submit.body}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.submit.name}
          <input
            required
            value={form.nombre}
            onChange={(event) => updateField('nombre', event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.submit.campaign}
          <input
            value={form.campana}
            onChange={(event) => updateField('campana', event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.submit.type}
          <select
            value={form.tipo}
            onChange={(event) => updateField('tipo', event.target.value as EntryType)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            <option value="persona">{t.entry.persona}</option>
            <option value="organizacion">{t.entry.organizacion}</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700 md:col-span-2">
          {t.submit.description}
          <textarea
            rows={4}
            value={form.descripcion}
            onChange={(event) => updateField('descripcion', event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.submit.verification}
          <input
            required
            type="url"
            value={form.verificacion_url}
            onChange={(event) => updateField('verificacion_url', event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.submit.contact}
          <input
            required
            value={form.contacto}
            onChange={(event) => updateField('contacto', event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        {TURNSTILE_SITE_KEY ? (
          <div className="md:col-span-2">
            <Turnstile siteKey={TURNSTILE_SITE_KEY} language={lang} onVerify={handleVerify} onExpire={handleExpire} />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={status === 'loading' || (Boolean(TURNSTILE_SITE_KEY) && !token)}
            className="inline-flex items-center gap-2 rounded-md bg-[#071a3d] px-4 py-2 font-bold text-white hover:bg-[#0d2a61] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} aria-hidden="true" />
            {status === 'loading' ? t.submit.sending : t.submit.send}
          </button>
        </div>
      </form>

      {status === 'success' ? <p className="mt-4 text-sm font-semibold text-emerald-700">{t.submit.success}</p> : null}
      {status === 'error' ? <p className="mt-4 text-sm font-semibold text-red-700">{t.submit.error}</p> : null}
    </section>
  )
}
