import type { Publicacion, PublicacionesResponse } from '../types'

export async function getPublicaciones(
  params: {
    q?: string
    tipo?: string
    pais?: string
    estado_ve?: string
    offset?: number
    limit?: number
  } = {},
): Promise<PublicacionesResponse> {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.tipo) qs.set('tipo', params.tipo)
  if (params.pais) qs.set('pais', params.pais)
  if (params.estado_ve) qs.set('estado_ve', params.estado_ve)
  if (params.offset) qs.set('offset', String(params.offset))
  if (params.limit) qs.set('limit', String(params.limit))

  const res = await fetch(`/api/publicaciones?${qs}`)
  if (!res.ok) throw new Error('Error al cargar publicaciones')
  return res.json() as Promise<PublicacionesResponse>
}

export async function createPublicacion(payload: {
  tipo: string
  titulo: string
  info: string
  pais: string
  estado_ve?: string
  ciudad?: string
  contactos: { tipo: string; valor: string }[]
  turnstileToken?: string
}): Promise<void> {
  const res = await fetch('/api/publicaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = (await res.json()) as { error?: string }
    throw new Error(data.error ?? 'Error al publicar')
  }
}

export async function getAdminPublicaciones(secret: string): Promise<Publicacion[]> {
  const res = await fetch('/api/admin/publicaciones', {
    headers: { Authorization: `Bearer ${secret}` },
  })
  if (!res.ok) throw new Error('Clave incorrecta')
  const data = (await res.json()) as { publicaciones: Publicacion[] }
  return data.publicaciones
}

export async function deactivatePublicacion(secret: string, id: number): Promise<void> {
  const res = await fetch(`/api/admin/publicaciones/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${secret}` },
  })
  if (!res.ok) throw new Error('Error al desactivar')
}
