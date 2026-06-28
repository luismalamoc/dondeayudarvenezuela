import { Fragment, useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import CampaignFields from '../components/CampaignFields'
import { EMPTY_CAMPAIGN, type CampaignFormValue } from '../lib/campaign'
import { deactivatePublicacion, getAdminPublicaciones, updatePublicacion } from '../lib/api'
import type { Publicacion } from '../types'

export default function Admin() {
  const [secret, setSecret] = useState<string>(() => window.sessionStorage.getItem('admin-secret') ?? '')
  const [authenticated, setAuthenticated] = useState(false)
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<CampaignFormValue>(EMPTY_CAMPAIGN)
  const [draftActivo, setDraftActivo] = useState(1)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    const saved = window.sessionStorage.getItem('admin-secret')
    if (!saved) return
    getAdminPublicaciones(saved)
      .then((data) => {
        setPublicaciones(data)
        setAuthenticated(true)
      })
      .catch(() => {
        setAuthenticated(false)
      })
  }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const data = await getAdminPublicaciones(secret)
      window.sessionStorage.setItem('admin-secret', secret)
      setPublicaciones(data)
      setAuthenticated(true)
    } catch {
      setError('Clave incorrecta')
    }
  }

  async function deactivate(id: number, titulo: string) {
    if (!window.confirm(`¿Desactivar "${titulo}"?`)) return
    await deactivatePublicacion(secret, id)
    setPublicaciones((prev) => prev.map((p) => (p.id === id ? { ...p, activo: 0 } : p)))
  }

  function startEdit(p: Publicacion) {
    setEditingId(p.id)
    setEditError('')
    setDraftActivo(p.activo)
    setDraft({
      tipo: p.tipo,
      titulo: p.titulo,
      info: p.info,
      pais: p.pais ?? '',
      estadoVe: p.estado_ve ?? '',
      ciudad: p.ciudad ?? '',
      contactos: p.contactos.map((c) => ({ tipo: c.tipo, valor: c.valor })),
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
    setDraft(EMPTY_CAMPAIGN)
    setDraftActivo(1)
  }

  async function saveEdit(id: number) {
    setEditError('')

    if (!draft.tipo) {
      setEditError('Indica si es una persona o una organización.')
      return
    }
    if (!draft.titulo.trim() || !draft.info.trim()) {
      setEditError('Título e información son requeridos.')
      return
    }
    if (!draft.pais) {
      setEditError('Selecciona el país.')
      return
    }

    const contactos = draft.contactos.filter((c) => c.valor.trim())

    setSaving(true)
    try {
      await updatePublicacion(secret, id, {
        tipo: draft.tipo,
        titulo: draft.titulo.trim(),
        info: draft.info.trim(),
        pais: draft.pais,
        estado_ve: draft.estadoVe || undefined,
        ciudad: draft.ciudad.trim() || undefined,
        contactos,
        activo: draftActivo,
      })
      setPublicaciones((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                tipo: draft.tipo as Publicacion['tipo'],
                titulo: draft.titulo.trim(),
                info: draft.info.trim(),
                pais: draft.pais || null,
                estado_ve: draft.estadoVe || null,
                ciudad: draft.ciudad.trim() || null,
                activo: draftActivo,
                contactos: contactos.map((c, i) => ({ id: i, tipo: c.tipo, valor: c.valor.trim() })),
              }
            : p,
        ),
      )
      cancelEdit()
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function logout() {
    window.sessionStorage.removeItem('admin-secret')
    setAuthenticated(false)
    setSecret('')
    setPublicaciones([])
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-4">
        <form onSubmit={login} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-[#071a3d]">Admin</h1>
          <label className="mt-6 grid gap-1.5 text-sm font-semibold text-slate-700">
            Clave de acceso
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#071a3d] focus:outline-none"
            />
          </label>
          <button type="submit" className="mt-4 w-full rounded-md bg-[#071a3d] px-4 py-2 font-bold text-white">
            Entrar
          </button>
          {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </form>
      </main>
    )
  }

  const activas = publicaciones.filter((p) => p.activo === 1).length

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-black text-[#071a3d]">Admin</h1>
            <p className="text-sm text-slate-500">
              {activas} activas · {publicaciones.length} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm font-bold text-slate-600 hover:text-slate-900">
              Ver sitio
            </a>
            <button
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600">ID</th>
                <th className="px-4 py-3 font-bold text-slate-600">Título</th>
                <th className="px-4 py-3 font-bold text-slate-600">Contactos</th>
                <th className="px-4 py-3 font-bold text-slate-600">Fecha</th>
                <th className="px-4 py-3 font-bold text-slate-600">Estado</th>
                <th className="px-4 py-3 font-bold text-slate-600" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publicaciones.map((p) => (
                <Fragment key={p.id}>
                  <tr className={p.activo === 0 ? 'opacity-50' : ''}>
                    <td className="px-4 py-3 text-slate-400">{p.id}</td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-semibold text-slate-900">{p.titulo}</p>
                      <p className="truncate text-xs text-slate-400">{p.info.slice(0, 60)}…</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.contactos.length}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(p.creado_en + 'Z').toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {p.activo === 1 ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                          Activa
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => (editingId === p.id ? cancelEdit() : startEdit(p))}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={12} aria-hidden="true" />
                          {editingId === p.id ? 'Cerrar' : 'Editar'}
                        </button>
                        {p.activo === 1 ? (
                          <button
                            onClick={() => deactivate(p.id, p.titulo)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={12} aria-hidden="true" />
                            Desactivar
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {editingId === p.id ? (
                    <tr>
                      <td colSpan={6} className="bg-slate-50 px-4 py-6">
                        <div className="mx-auto grid max-w-2xl gap-5">
                          <CampaignFields
                            value={draft}
                            onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
                            idPrefix={`edit-${p.id}`}
                          />

                          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3">
                            <input
                              type="checkbox"
                              checked={draftActivo === 1}
                              onChange={(e) => setDraftActivo(e.target.checked ? 1 : 0)}
                              className="accent-[#071a3d]"
                            />
                            <span className="text-sm font-semibold text-slate-700">
                              Publicación activa (visible en el sitio)
                            </span>
                          </label>

                          {editError ? (
                            <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                              {editError}
                            </p>
                          ) : null}

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => saveEdit(p.id)}
                              disabled={saving}
                              className="rounded-md bg-[#071a3d] px-5 py-2.5 text-sm font-black text-white hover:bg-[#0d2a61] disabled:opacity-60"
                            >
                              {saving ? 'Guardando…' : 'Guardar cambios'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-white"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
          {publicaciones.length === 0 ? (
            <p className="px-4 py-8 text-center text-slate-500">No hay publicaciones.</p>
          ) : null}
        </div>
      </main>
    </div>
  )
}
