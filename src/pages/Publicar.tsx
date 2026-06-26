import { useCallback, useState } from 'react'
import { Plus, X } from 'lucide-react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Turnstile from '../components/Turnstile'
import { createPublicacion } from '../lib/api'
import { ESTADOS_VENEZUELA, PAISES } from '../lib/venezuela'
import type { ContactoTipo } from '../types'

interface ContactoDraft {
  tipo: ContactoTipo
  valor: string
}

const CONTACT_PLACEHOLDERS: Record<ContactoTipo, string> = {
  instagram: '@tucuenta',
  twitter_x: '@tucuenta',
  whatsapp: '+58 412 1234567',
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export default function Publicar() {
  const [tipo, setTipo] = useState<'persona' | 'organizacion' | ''>('')
  const [titulo, setTitulo] = useState('')
  const [info, setInfo] = useState('')
  const [pais, setPais] = useState('')
  const [estadoVe, setEstadoVe] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [contactos, setContactos] = useState<ContactoDraft[]>([])
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), [])
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(undefined), [])

  function addContacto() {
    setContactos((prev) => [...prev, { tipo: 'whatsapp', valor: '' }])
  }

  function removeContacto(index: number) {
    setContactos((prev) => prev.filter((_, i) => i !== index))
  }

  function updateContacto(index: number, field: keyof ContactoDraft, value: string) {
    setContactos((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  function handlePaisChange(newPais: string) {
    setPais(newPais)
    setEstadoVe('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!tipo) {
      setError('Indica si eres una persona o una organización.')
      return
    }

    if (!pais) {
      setError('Selecciona el país desde donde coordinas la ayuda.')
      return
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Completa la verificación antes de publicar.')
      return
    }

    setSubmitting(true)
    try {
      await createPublicacion({
        tipo,
        titulo: titulo.trim(),
        info: info.trim(),
        pais,
        estado_ve: estadoVe || undefined,
        ciudad: ciudad.trim() || undefined,
        contactos: contactos.filter((c) => c.valor.trim()),
        turnstileToken,
      })
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
        <Header />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center">
            <p className="text-4xl">🎉</p>
            <h2 className="mt-4 text-2xl font-black text-emerald-900">¡Tu campaña fue publicada!</h2>
            <p className="mt-2 text-emerald-800">Ya está visible en el directorio.</p>
            <a
              href="/"
              className="mt-6 inline-block rounded-md bg-[#071a3d] px-6 py-3 font-black text-white hover:bg-[#0d2a61]"
            >
              Ver todas las campañas
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-black text-[#071a3d]">Publica tu campaña de ayuda</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tu publicación queda visible de inmediato. No editamos ni moderamos el contenido.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <div className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">
              ¿Quién coordina la ayuda? <span className="text-red-600">*</span>
            </span>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-slate-300 px-4 py-3 has-[:checked]:border-[#071a3d] has-[:checked]:bg-[#f0f4ff]">
                <input
                  type="radio"
                  name="tipo"
                  value="persona"
                  checked={tipo === 'persona'}
                  onChange={() => setTipo('persona')}
                  className="accent-[#071a3d]"
                />
                <span className="text-sm font-semibold text-slate-700">Persona</span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-slate-300 px-4 py-3 has-[:checked]:border-[#071a3d] has-[:checked]:bg-[#f0f4ff]">
                <input
                  type="radio"
                  name="tipo"
                  value="organizacion"
                  checked={tipo === 'organizacion'}
                  onChange={() => setTipo('organizacion')}
                  className="accent-[#071a3d]"
                />
                <span className="text-sm font-semibold text-slate-700">Organización</span>
              </label>
            </div>
          </div>

          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">
              Título de la campaña <span className="text-red-600">*</span>
            </span>
            <input
              required
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Familia Rodríguez — damnificados en Caracas"
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#071a3d] focus:outline-none"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">
              Información para donar <span className="text-red-600">*</span>
            </span>
            <p className="text-xs text-slate-500">
              Pega aquí los datos de transferencia, links a GoFundMe, Donorbox, PayPal, Zelle, pago móvil, etc.
            </p>
            <textarea
              required
              rows={6}
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder={
                'Banco Venezuela: cuenta 01234567890\nZelle: usuario@email.com\nhttps://gofundme.com/mi-campaña'
              }
              className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-[#071a3d] focus:outline-none"
            />
          </label>

          {/* Ubicación */}
          <div className="grid gap-3">
            <span className="text-sm font-bold text-slate-700">
              Ubicación <span className="text-red-600">*</span>
            </span>
            <select
              required
              value={pais}
              onChange={(e) => handlePaisChange(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#071a3d] focus:outline-none"
            >
              <option value="">Selecciona el país</option>
              {PAISES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>

            {pais === 'VE' && (
              <select
                value={estadoVe}
                onChange={(e) => setEstadoVe(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#071a3d] focus:outline-none"
              >
                <option value="">Estado (opcional)</option>
                {ESTADOS_VENEZUELA.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ciudad (opcional)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#071a3d] focus:outline-none"
            />
          </div>

          {/* Contactos */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Contactos (opcional)</span>
              <button
                type="button"
                onClick={addContacto}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Plus size={14} aria-hidden="true" />
                Agregar
              </button>
            </div>

            {contactos.length === 0 ? (
              <p className="text-xs text-slate-400">
                Agrega tu WhatsApp, Instagram o Twitter/X para que puedan contactarte.
              </p>
            ) : null}

            {contactos.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={c.tipo}
                  onChange={(e) => updateContacto(i, 'tipo', e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm font-semibold text-slate-700"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter_x">Twitter/X</option>
                </select>
                <input
                  type="text"
                  value={c.valor}
                  onChange={(e) => updateContacto(i, 'valor', e.target.value)}
                  placeholder={CONTACT_PLACEHOLDERS[c.tipo]}
                  className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#071a3d] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeContacto(i)}
                  className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Eliminar contacto"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          {TURNSTILE_SITE_KEY ? (
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              language="es"
              onVerify={handleTurnstileVerify}
              onExpire={handleTurnstileExpire}
            />
          ) : null}

          {error ? <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-[#071a3d] px-6 py-3 font-black text-white hover:bg-[#0d2a61] disabled:opacity-60"
          >
            {submitting ? 'Publicando…' : 'Publicar campaña'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  )
}
