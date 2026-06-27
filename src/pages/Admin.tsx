import { useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import LangToggle from '../components/LangToggle'
import {
  createContactMethod,
  createEntry,
  createMethod,
  deactivateEntry,
  getAdminEntries,
  getAdminSolicitudes,
  removeContactMethod,
  removeMethod,
  updateSolicitud,
} from '../lib/api'
import type { Dictionary } from '../i18n/types'
import type {
  ContactMethod,
  ContactMethodDraft,
  ContactMethodType,
  Entry,
  EntryDraft,
  Lang,
  MethodDraft,
  MethodType,
  Solicitud,
} from '../types'
import { CURRENCIES } from '../lib/currencies'
import { ESTADOS_VENEZUELA } from '../lib/venezuela'

interface AdminProps {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Dictionary
}

function emptyMethod(): MethodDraft {
  return { tipo: 'otro', pais: '', detalle: '', moneda: '' }
}

function emptyContact(): ContactMethodDraft {
  return { tipo: 'whatsapp', label: '', detalle: '' }
}

function emptyEntry(): EntryDraft {
  return {
    tipo: 'persona',
    nombre: '',
    campana: '',
    descripcion_es: '',
    descripcion_en: '',
    verificacion_url: '',
    estado_ve: '',
    ciudad_ve: '',
    destacado: 0,
    metodos: [emptyMethod()],
    contactos: [emptyContact()],
  }
}

interface MethodForm {
  entrada_id: string
  tipo: MethodType
  pais: string
  detalle: string
  moneda: string
}

interface ContactForm {
  entrada_id: string
  tipo: ContactMethodType
  label: string
  detalle: string
}

function emptyMethodForm(): MethodForm {
  return { entrada_id: '', tipo: 'otro', pais: '', detalle: '', moneda: '' }
}

function emptyContactForm(): ContactForm {
  return { entrada_id: '', tipo: 'whatsapp', label: '', detalle: '' }
}

const CONTACT_TYPES: ContactMethodType[] = ['whatsapp', 'instagram', 'x', 'web']

export default function Admin({ lang, setLang, t }: AdminProps) {
  const [secret, setSecret] = useState<string>(() => window.sessionStorage.getItem('admin-secret') ?? '')
  const [authenticated, setAuthenticated] = useState(Boolean(secret))
  const [entries, setEntries] = useState<Entry[]>([])
  const [requests, setRequests] = useState<Solicitud[]>([])
  const [entryForm, setEntryForm] = useState<EntryDraft>(emptyEntry)
  const [methodForm, setMethodForm] = useState<MethodForm>(emptyMethodForm)
  const [contactForm, setContactForm] = useState<ContactForm>(emptyContactForm)
  const [message, setMessage] = useState('')

  async function loadAdminData(activeSecret: string) {
    const [entriesData, requestsData] = await Promise.all([
      getAdminEntries(activeSecret),
      getAdminSolicitudes(activeSecret),
    ])
    setEntries(entriesData.entradas)
    setRequests(requestsData.solicitudes)
  }

  useEffect(() => {
    if (!authenticated) return
    let active = true
    async function loadOnMount() {
      try {
        await loadAdminData(secret)
      } catch (apiError: unknown) {
        if (!active) return
        setMessage(apiError instanceof Error ? apiError.message : 'Error')
        setAuthenticated(false)
        window.sessionStorage.removeItem('admin-secret')
      }
    }
    void loadOnMount()
    return () => {
      active = false
    }
  }, [authenticated, secret])

  function updateEntry<K extends keyof EntryDraft>(field: K, value: EntryDraft[K]) {
    setEntryForm((current) => ({ ...current, [field]: value }))
  }

  function updateEntryMethod<K extends keyof MethodDraft>(index: number, field: K, value: MethodDraft[K]) {
    setEntryForm((current) => ({
      ...current,
      metodos: current.metodos.map((method, i) => (i === index ? { ...method, [field]: value } : method)),
    }))
  }

  function updateEntryContact<K extends keyof ContactMethodDraft>(
    index: number,
    field: K,
    value: ContactMethodDraft[K],
  ) {
    setEntryForm((current) => ({
      ...current,
      contactos: current.contactos.map((contact, i) => (i === index ? { ...contact, [field]: value } : contact)),
    }))
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await loadAdminData(secret)
      window.sessionStorage.setItem('admin-secret', secret)
      setAuthenticated(true)
      setMessage('')
    } catch (apiError: unknown) {
      setMessage(apiError instanceof Error ? apiError.message : 'Error')
    }
  }

  async function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createEntry(secret, entryForm)
    setEntryForm(emptyEntry())
    await loadAdminData(secret)
  }

  async function handleDeactivate(id: number) {
    await deactivateEntry(secret, id)
    await loadAdminData(secret)
  }

  async function handleAddMethod(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createMethod(secret, {
      entrada_id: Number(methodForm.entrada_id),
      tipo: methodForm.tipo,
      pais: methodForm.pais || null,
      detalle: methodForm.detalle,
      moneda: methodForm.moneda || null,
    })
    setMethodForm(emptyMethodForm())
    await loadAdminData(secret)
  }

  async function handleRemoveMethod(id: number) {
    await removeMethod(secret, id)
    await loadAdminData(secret)
  }

  async function handleAddContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createContactMethod(secret, {
      entrada_id: Number(contactForm.entrada_id),
      tipo: contactForm.tipo,
      label: contactForm.label || null,
      detalle: contactForm.detalle,
    })
    setContactForm(emptyContactForm())
    await loadAdminData(secret)
  }

  async function handleRemoveContact(id: number) {
    await removeContactMethod(secret, id)
    await loadAdminData(secret)
  }

  async function handleRequest(id: number, estado: 'aprobado' | 'rechazado') {
    await updateSolicitud(secret, id, estado)
    await loadAdminData(secret)
  }

  function logout() {
    window.sessionStorage.removeItem('admin-secret')
    setAuthenticated(false)
    setSecret('')
  }

  const methodTypes = Object.keys(t.methodLabels) as MethodType[]

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-4">
        <form onSubmit={login} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-black text-[#071a3d]">{t.admin.title}</h1>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <label className="mt-6 grid gap-1 text-sm font-semibold text-slate-700">
            {t.admin.secret}
            <input
              type="password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <button type="submit" className="mt-4 w-full rounded-md bg-[#071a3d] px-4 py-2 font-bold text-white">
            {t.admin.enter}
          </button>
          {message ? <p className="mt-4 text-sm font-semibold text-red-700">{message}</p> : null}
        </form>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-black text-[#071a3d]">{t.admin.title}</h1>
            <a href="/" className="text-sm font-bold text-slate-600 hover:text-[#071a3d]">
              {t.nav.public}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} />
            <button
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700"
            >
              {t.admin.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* New entry form */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-black text-slate-950">{t.admin.newEntry}</h2>
          <form onSubmit={handleCreateEntry} className="mt-4 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                required
                placeholder={t.submit.name}
                value={entryForm.nombre}
                onChange={(event) => updateEntry('nombre', event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              <select
                value={entryForm.tipo}
                onChange={(event) => updateEntry('tipo', event.target.value as EntryDraft['tipo'])}
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
              >
                <option value="persona">{t.entry.persona}</option>
                <option value="organizacion">{t.entry.organizacion}</option>
              </select>
            </div>
            <input
              placeholder={t.admin.campaign}
              value={entryForm.campana}
              onChange={(event) => updateEntry('campana', event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <textarea
              rows={3}
              placeholder="Descripcion ES"
              value={entryForm.descripcion_es}
              onChange={(event) => updateEntry('descripcion_es', event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <textarea
              rows={3}
              placeholder="Description EN"
              value={entryForm.descripcion_en}
              onChange={(event) => updateEntry('descripcion_en', event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <input
              placeholder="https://"
              value={entryForm.verificacion_url}
              onChange={(event) => updateEntry('verificacion_url', event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={entryForm.estado_ve}
                onChange={(event) => updateEntry('estado_ve', event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
              >
                <option value="">{t.admin.stateVe}</option>
                {ESTADOS_VENEZUELA.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <input
                placeholder={t.admin.cityVe}
                value={entryForm.ciudad_ve}
                onChange={(event) => updateEntry('ciudad_ve', event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(entryForm.destacado)}
                onChange={(event) => updateEntry('destacado', event.target.checked ? 1 : 0)}
              />
              {t.entry.featured}
            </label>

            <p className="text-sm font-bold text-slate-600">{t.entry.contact}</p>
            <div className="space-y-3">
              {entryForm.contactos.map((contact, index) => (
                <div key={index} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-3">
                  <select
                    value={contact.tipo}
                    onChange={(event) => updateEntryContact(index, 'tipo', event.target.value as ContactMethodType)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-2"
                  >
                    {CONTACT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t.contactLabels[type]}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder={t.admin.label}
                    value={contact.label}
                    onChange={(event) => updateEntryContact(index, 'label', event.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-2"
                  />
                  <input
                    required
                    placeholder={t.admin.detail}
                    value={contact.detalle}
                    onChange={(event) => updateEntryContact(index, 'detalle', event.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-2"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setEntryForm((current) => ({ ...current, contactos: [...current.contactos, emptyContact()] }))
              }
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 font-bold text-slate-700"
            >
              <Plus size={16} aria-hidden="true" />
              {t.admin.addContact}
            </button>

            <p className="text-sm font-bold text-slate-600">{t.entry.methods}</p>
            <div className="space-y-3">
              {entryForm.metodos.map((method, index) => (
                <div key={index} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-4">
                  <select
                    value={method.tipo}
                    onChange={(event) => updateEntryMethod(index, 'tipo', event.target.value as MethodType)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-2"
                  >
                    {methodTypes.map((type) => (
                      <option key={type} value={type}>
                        {t.methodLabels[type]}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder={t.admin.country}
                    value={method.pais}
                    onChange={(event) => updateEntryMethod(index, 'pais', event.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-2"
                  />
                  <select
                    value={method.moneda}
                    onChange={(event) => updateEntryMethod(index, 'moneda', event.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-2"
                  >
                    <option value="">{t.admin.currencyField}</option>
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    placeholder={t.admin.detail}
                    value={method.detalle}
                    onChange={(event) => updateEntryMethod(index, 'detalle', event.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-2"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setEntryForm((current) => ({ ...current, metodos: [...current.metodos, emptyMethod()] }))}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 font-bold text-slate-700"
            >
              <Plus size={16} aria-hidden="true" />
              {t.admin.addMethod}
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#071a3d] px-4 py-2 font-bold text-white"
            >
              <Save size={16} aria-hidden="true" />
              {t.admin.create}
            </button>
          </form>
        </section>

        {/* Quick-add payment method */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">{t.admin.addMethod}</h2>
          <form onSubmit={handleAddMethod} className="mt-4 grid gap-3">
            <select
              required
              value={methodForm.entrada_id}
              onChange={(event) => setMethodForm((current) => ({ ...current, entrada_id: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              <option value="">{t.admin.entryPlaceholder}</option>
              {entries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.nombre}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={methodForm.tipo}
                onChange={(event) =>
                  setMethodForm((current) => ({ ...current, tipo: event.target.value as MethodType }))
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
              >
                {methodTypes.map((type) => (
                  <option key={type} value={type}>
                    {t.methodLabels[type]}
                  </option>
                ))}
              </select>
              <input
                placeholder={t.admin.country}
                value={methodForm.pais}
                onChange={(event) => setMethodForm((current) => ({ ...current, pais: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              <select
                value={methodForm.moneda}
                onChange={(event) => setMethodForm((current) => ({ ...current, moneda: event.target.value }))}
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
              >
                <option value="">{t.admin.currencyField}</option>
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              required
              rows={3}
              placeholder={t.admin.detail}
              value={methodForm.detalle}
              onChange={(event) => setMethodForm((current) => ({ ...current, detalle: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <button type="submit" className="rounded-md bg-[#071a3d] px-4 py-2 font-bold text-white">
              {t.admin.save}
            </button>
          </form>
        </section>

        {/* Quick-add contact method */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">{t.admin.addContact}</h2>
          <form onSubmit={handleAddContact} className="mt-4 grid gap-3">
            <select
              required
              value={contactForm.entrada_id}
              onChange={(event) => setContactForm((current) => ({ ...current, entrada_id: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              <option value="">{t.admin.entryPlaceholder}</option>
              {entries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.nombre}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={contactForm.tipo}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, tipo: event.target.value as ContactMethodType }))
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
              >
                {CONTACT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t.contactLabels[type]}
                  </option>
                ))}
              </select>
              <input
                placeholder={t.admin.label}
                value={contactForm.label}
                onChange={(event) => setContactForm((current) => ({ ...current, label: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <input
              required
              placeholder={t.admin.detail}
              value={contactForm.detalle}
              onChange={(event) => setContactForm((current) => ({ ...current, detalle: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <button type="submit" className="rounded-md bg-[#071a3d] px-4 py-2 font-bold text-white">
              {t.admin.save}
            </button>
          </form>
        </section>

        {/* Entries list */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-black text-slate-950">{t.admin.entries}</h2>
          <div className="mt-4 grid gap-3">
            {entries.length === 0 ? <p>{t.admin.empty}</p> : null}
            {entries.map((entry) => (
              <article key={entry.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950">{entry.nombre}</h3>
                    <p className="text-sm text-slate-600">
                      {entry.tipo} / activo: {entry.activo}
                      {entry.estado_ve ? ` / ${entry.ciudad_ve ? `${entry.ciudad_ve}, ` : ''}${entry.estado_ve}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeactivate(entry.id)}
                    className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    {t.admin.deactivate}
                  </button>
                </div>
                {entry.contactos.length > 0 ? (
                  <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                    {entry.contactos.map((contact: ContactMethod) => (
                      <li key={contact.id} className="flex items-center justify-between gap-3 rounded bg-sky-50 p-2">
                        <span>
                          {t.contactLabels[contact.tipo as ContactMethodType] ?? contact.tipo}
                          {contact.label ? ` (${contact.label})` : ''}: {contact.detalle}
                        </span>
                        <button onClick={() => handleRemoveContact(contact.id)} className="font-bold text-red-700">
                          {t.admin.remove}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                  {entry.metodos.map((method) => (
                    <li key={method.id} className="flex items-center justify-between gap-3 rounded bg-slate-50 p-2">
                      <span>
                        {t.methodLabels[method.tipo] ?? method.tipo}: {method.detalle}
                      </span>
                      <button onClick={() => handleRemoveMethod(method.id)} className="font-bold text-red-700">
                        {t.admin.remove}
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Pending requests */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-black text-slate-950">{t.admin.requests}</h2>
          <div className="mt-4 grid gap-3">
            {requests.length === 0 ? <p>{t.admin.empty}</p> : null}
            {requests.map((request) => (
              <article key={request.id} className="rounded-md border border-slate-200 p-4">
                <h3 className="font-black text-slate-950">{request.nombre}</h3>
                <p className="mt-1 text-sm text-slate-600">{request.descripcion}</p>
                <p className="mt-2 break-words text-sm text-slate-600">
                  {request.verificacion_url} / {request.contacto}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleRequest(request.id, 'aprobado')}
                    className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white"
                  >
                    {t.admin.approve}
                  </button>
                  <button
                    onClick={() => handleRequest(request.id, 'rechazado')}
                    className="rounded-md bg-red-700 px-3 py-2 text-sm font-bold text-white"
                  >
                    {t.admin.reject}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
