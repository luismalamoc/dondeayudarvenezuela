import type {
  Entry,
  EntryDraft,
  PaymentMethod,
  Solicitud,
  SolicitudDraft,
} from '../types'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data
}

export function getEntries() {
  return request<{ entradas: Entry[] }>('/api/entradas')
}

export function submitRequest(payload: SolicitudDraft, turnstileToken: string) {
  return request<{ ok: boolean }>('/api/solicitudes', {
    method: 'POST',
    body: JSON.stringify({ ...payload, turnstileToken }),
  })
}

function adminRequest<T>(secret: string, path: string, options: RequestOptions = {}) {
  return request<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...options.headers,
    },
  })
}

export function getAdminEntries(secret: string) {
  return adminRequest<{ entradas: Entry[] }>(secret, '/api/admin/entradas')
}

export function getAdminSolicitudes(secret: string) {
  return adminRequest<{ solicitudes: Solicitud[] }>(secret, '/api/admin/solicitudes')
}

export function createEntry(secret: string, payload: EntryDraft) {
  return adminRequest<{ ok: boolean; id: number }>(secret, '/api/admin/entradas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deactivateEntry(secret: string, id: number) {
  return adminRequest<{ ok: boolean }>(secret, `/api/admin/entradas/${id}`, {
    method: 'DELETE',
  })
}

export function createMethod(
  secret: string,
  payload: Pick<PaymentMethod, 'entrada_id' | 'tipo' | 'pais' | 'detalle' | 'moneda'>,
) {
  return adminRequest<{ ok: boolean; id: number }>(secret, '/api/admin/metodos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function removeMethod(secret: string, id: number) {
  return adminRequest<{ ok: boolean }>(secret, `/api/admin/metodos/${id}`, {
    method: 'DELETE',
  })
}

export function updateSolicitud(secret: string, id: number, estado: 'aprobado' | 'rechazado') {
  return adminRequest<{ ok: boolean }>(secret, `/api/admin/solicitudes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ estado }),
  })
}
