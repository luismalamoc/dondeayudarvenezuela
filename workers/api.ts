import { isValidEntry, isValidSolicitud } from '../src/lib/validation'

export interface Env {
  DB: D1Database
  ASSETS: Fetcher
  ADMIN_SECRET: string
  TURNSTILE_SECRET?: string
}

type EntryType = 'persona' | 'organizacion'

interface EntryRow {
  id: number
  tipo: EntryType
  nombre: string
  campana: string | null
  descripcion_es: string | null
  descripcion_en: string | null
  verificacion_url: string | null
  activo: number
  destacado: number
  creado_en: string
}

interface MethodRow {
  id: number
  entrada_id: number
  tipo: string
  pais: string | null
  detalle: string
  moneda: string | null
}

interface MethodInput {
  tipo?: string
  pais?: string | null
  detalle?: string
  moneda?: string | null
}

interface EntryInput {
  tipo?: string
  nombre?: string
  campana?: string
  descripcion_es?: string
  descripcion_en?: string
  verificacion_url?: string
  activo?: number | boolean
  destacado?: number | boolean
  metodos?: MethodInput[]
}

interface SolicitudInput {
  nombre?: string
  campana?: string
  tipo?: string
  descripcion?: string
  verificacion_url?: string
  contacto?: string
  turnstileToken?: string
}

const jsonHeaders: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...jsonHeaders, ...init.headers },
  })
}

function routeParam(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) return null
  const value = pathname.slice(prefix.length).split('/')[0]
  return value || null
}

function requireAdmin(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization') ?? ''
  const expected = `Bearer ${env.ADMIN_SECRET}`
  return Boolean(env.ADMIN_SECRET) && authHeader === expected
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

function normalizeEntry(row: EntryRow, methodsByEntry: Map<number, MethodRow[]>) {
  return {
    ...row,
    activo: Number(row.activo),
    destacado: Number(row.destacado),
    metodos: methodsByEntry.get(row.id) ?? [],
  }
}

async function listEntries(env: Env, includeInactive = false) {
  const entriesQuery = includeInactive
    ? 'SELECT * FROM entradas ORDER BY destacado DESC, creado_en DESC, id DESC'
    : 'SELECT * FROM entradas WHERE activo = 1 ORDER BY destacado DESC, creado_en DESC, id DESC'

  const [entriesResult, methodsResult] = await Promise.all([
    env.DB.prepare(entriesQuery).all<EntryRow>(),
    env.DB.prepare('SELECT * FROM metodos_pago ORDER BY id ASC').all<MethodRow>(),
  ])

  const entries = entriesResult.results
  const entryIds = new Set(entries.map((entry) => entry.id))
  const methodsByEntry = new Map<number, MethodRow[]>()
  for (const method of methodsResult.results) {
    if (!entryIds.has(method.entrada_id)) continue
    const group = methodsByEntry.get(method.entrada_id) ?? []
    group.push(method)
    methodsByEntry.set(method.entrada_id, group)
  }

  return entries.map((entry) => normalizeEntry(entry, methodsByEntry))
}

async function getEntry(env: Env, id: string) {
  const entry = await env.DB.prepare('SELECT * FROM entradas WHERE id = ? AND activo = 1')
    .bind(id)
    .first<EntryRow>()
  if (!entry) return null
  const methods = await env.DB.prepare('SELECT * FROM metodos_pago WHERE entrada_id = ? ORDER BY id ASC')
    .bind(id)
    .all<MethodRow>()
  return normalizeEntry(entry, new Map([[entry.id, methods.results]]))
}

function methodStatements(env: Env, entryId: number, methods: MethodInput[]) {
  return methods
    .filter((method): method is MethodInput & { detalle: string } => Boolean(method.detalle))
    .map((method) =>
      env.DB.prepare('INSERT INTO metodos_pago (entrada_id, tipo, pais, detalle, moneda) VALUES (?, ?, ?, ?, ?)').bind(
        entryId,
        method.tipo ?? 'otro',
        method.pais ?? null,
        method.detalle,
        method.moneda ?? null,
      ),
    )
}

async function createEntry(env: Env, payload: EntryInput | null): Promise<Response> {
  if (!isValidEntry(payload)) {
    return json({ error: 'Invalid entry' }, { status: 400 })
  }

  const result = await env.DB.prepare(
    'INSERT INTO entradas (tipo, nombre, campana, descripcion_es, descripcion_en, verificacion_url, destacado) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      payload.tipo,
      payload.nombre,
      payload.campana ?? null,
      payload.descripcion_es ?? '',
      payload.descripcion_en ?? '',
      payload.verificacion_url ?? '',
      payload.destacado ? 1 : 0,
    )
    .run()

  const entryId = Number(result.meta.last_row_id)
  const statements = methodStatements(env, entryId, payload.metodos ?? [])
  if (statements.length > 0) {
    await env.DB.batch(statements)
  }

  return json({ ok: true, id: entryId }, { status: 201 })
}

async function updateEntry(env: Env, id: string, payload: EntryInput | null): Promise<Response> {
  if (!isValidEntry(payload)) {
    return json({ error: 'Invalid entry' }, { status: 400 })
  }

  await env.DB.prepare(
    'UPDATE entradas SET tipo = ?, nombre = ?, campana = ?, descripcion_es = ?, descripcion_en = ?, verificacion_url = ?, activo = ?, destacado = ? WHERE id = ?',
  )
    .bind(
      payload.tipo,
      payload.nombre,
      payload.campana ?? null,
      payload.descripcion_es ?? '',
      payload.descripcion_en ?? '',
      payload.verificacion_url ?? '',
      payload.activo ? 1 : 0,
      payload.destacado ? 1 : 0,
      id,
    )
    .run()

  if (Array.isArray(payload.metodos)) {
    await env.DB.prepare('DELETE FROM metodos_pago WHERE entrada_id = ?').bind(id).run()
    const statements = methodStatements(env, Number(id), payload.metodos)
    if (statements.length > 0) {
      await env.DB.batch(statements)
    }
  }

  return json({ ok: true })
}

async function verifyTurnstile(env: Env, token: string | undefined, ip: string | null): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true
  if (!token) return false

  const body = new FormData()
  body.append('secret', env.TURNSTILE_SECRET)
  body.append('response', token)
  if (ip) body.append('remoteip', ip)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    })
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false
  }
}

async function createSolicitud(request: Request, env: Env, payload: SolicitudInput | null): Promise<Response> {
  if (!isValidSolicitud(payload)) {
    return json({ error: 'Missing required fields' }, { status: 400 })
  }

  const passed = await verifyTurnstile(env, payload.turnstileToken, request.headers.get('CF-Connecting-IP'))
  if (!passed) {
    return json({ error: 'Turnstile verification failed' }, { status: 403 })
  }

  await env.DB.prepare(
    'INSERT INTO solicitudes (nombre, campana, tipo, descripcion, verificacion_url, contacto) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(payload.nombre, payload.campana ?? null, payload.tipo, payload.descripcion ?? '', payload.verificacion_url, payload.contacto)
    .run()

  return json({ ok: true }, { status: 201 })
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const { pathname } = url
  const method = request.method

  if (method === 'OPTIONS') return new Response(null, { headers: jsonHeaders })

  if (method === 'GET' && pathname === '/api/entradas') {
    return json({ entradas: await listEntries(env) })
  }

  const publicEntryId = routeParam(pathname, '/api/entradas/')
  if (method === 'GET' && publicEntryId) {
    const entry = await getEntry(env, publicEntryId)
    return entry ? json({ entrada: entry }) : json({ error: 'Not found' }, { status: 404 })
  }

  if (method === 'POST' && pathname === '/api/solicitudes') {
    return createSolicitud(request, env, await readJson<SolicitudInput>(request))
  }

  if (pathname.startsWith('/api/admin/')) {
    if (!requireAdmin(request, env)) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (method === 'GET' && pathname === '/api/admin/entradas') {
      return json({ entradas: await listEntries(env, true) })
    }
    if (method === 'POST' && pathname === '/api/admin/entradas') {
      return createEntry(env, await readJson<EntryInput>(request))
    }

    const adminEntryId = routeParam(pathname, '/api/admin/entradas/')
    if (adminEntryId && method === 'PUT') {
      return updateEntry(env, adminEntryId, await readJson<EntryInput>(request))
    }
    if (adminEntryId && method === 'DELETE') {
      await env.DB.prepare('UPDATE entradas SET activo = 0 WHERE id = ?').bind(adminEntryId).run()
      return json({ ok: true })
    }

    if (method === 'POST' && pathname === '/api/admin/metodos') {
      const payload = await readJson<MethodInput & { entrada_id?: number }>(request)
      if (!payload?.entrada_id || !payload.detalle) {
        return json({ error: 'Invalid method' }, { status: 400 })
      }
      const result = await env.DB.prepare(
        'INSERT INTO metodos_pago (entrada_id, tipo, pais, detalle, moneda) VALUES (?, ?, ?, ?, ?)',
      )
        .bind(payload.entrada_id, payload.tipo ?? 'otro', payload.pais ?? null, payload.detalle, payload.moneda ?? null)
        .run()
      return json({ ok: true, id: Number(result.meta.last_row_id) }, { status: 201 })
    }

    const adminMethodId = routeParam(pathname, '/api/admin/metodos/')
    if (adminMethodId && method === 'DELETE') {
      await env.DB.prepare('DELETE FROM metodos_pago WHERE id = ?').bind(adminMethodId).run()
      return json({ ok: true })
    }

    if (method === 'GET' && pathname === '/api/admin/solicitudes') {
      const result = await env.DB.prepare(
        "SELECT * FROM solicitudes WHERE estado = 'pendiente' ORDER BY creado_en DESC",
      ).all()
      return json({ solicitudes: result.results })
    }

    const solicitudId = routeParam(pathname, '/api/admin/solicitudes/')
    if (solicitudId && method === 'PUT') {
      const payload = await readJson<{ estado?: string }>(request)
      if (payload?.estado !== 'aprobado' && payload?.estado !== 'rechazado') {
        return json({ error: 'Invalid status' }, { status: 400 })
      }
      await env.DB.prepare('UPDATE solicitudes SET estado = ? WHERE id = ?').bind(payload.estado, solicitudId).run()
      return json({ ok: true })
    }
  }

  return json({ error: 'Not found' }, { status: 404 })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal error'
        return json({ error: message }, { status: 500 })
      }
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
