import { useCallback, useState } from 'react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Turnstile from '../components/Turnstile'
import CampaignFields from '../components/CampaignFields'
import { EMPTY_CAMPAIGN, type CampaignFormValue } from '../lib/campaign'
import { createPublicacion } from '../lib/api'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export default function Publicar() {
  const [form, setForm] = useState<CampaignFormValue>(EMPTY_CAMPAIGN)
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), [])
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(undefined), [])

  const handleFieldsChange = useCallback(
    (patch: Partial<CampaignFormValue>) => setForm((prev) => ({ ...prev, ...patch })),
    [],
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.tipo) {
      setError('Indica si eres una persona o una organización.')
      return
    }

    if (!form.pais) {
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
        tipo: form.tipo,
        titulo: form.titulo.trim(),
        info: form.info.trim(),
        pais: form.pais,
        estado_ve: form.estadoVe || undefined,
        ciudad: form.ciudad.trim() || undefined,
        contactos: form.contactos.filter((c) => c.valor.trim()),
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
          <CampaignFields value={form} onChange={handleFieldsChange} idPrefix="publicar" />

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
