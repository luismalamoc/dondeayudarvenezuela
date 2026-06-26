import { isValidPublicacion } from '../src/lib/validation'

export interface Env {
  DB: D1Database
  ASSETS: Fetcher
  ADMIN_SECRET: string
  TURNSTILE_SECRET?: string
}

interface PublicacionRow {
  id: number
  tipo: string
  titulo: string
  info: string
  pais: string | null
  estado_ve: string | null
  ciudad: string | null
  activo: number
  creado_en: string
}

interface ContactoRow {
  id: number
  publicacion_id: number
  tipo: string
  valor: string
}

interface PublicacionInput {
  tipo?: string
  titulo?: string
  info?: string
  pais?: string
  estado_ve?: string
  ciudad?: string
  contactos?: { tipo?: string; valor?: string }[]
  turnstileToken?: string
}

const jsonHeaders: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
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
  return Boolean(env.ADMIN_SECRET) && authHeader === `Bearer ${env.ADMIN_SECRET}`
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

async function listPublicaciones(
  env: Env,
  opts: {
    q?: string
    tipo?: string
    pais?: string
    estado_ve?: string
    limit: number
    offset: number
    includeInactive?: boolean
  },
) {
  const { q, tipo, pais, estado_ve, limit, offset, includeInactive = false } = opts

  const conditions: string[] = [includeInactive ? '1=1' : 'activo = 1']
  const params: (string | number)[] = []

  if (tipo) {
    conditions.push('tipo = ?')
    params.push(tipo)
  }
  if (pais) {
    conditions.push('pais = ?')
    params.push(pais)
  }
  if (estado_ve) {
    conditions.push('estado_ve = ?')
    params.push(estado_ve)
  }
  if (q) {
    conditions.push('(titulo LIKE ? OR info LIKE ?)')
    params.push(`%${q}%`, `%${q}%`)
  }

  // fetch limit+1 to determine if there are more results
  params.push(limit + 1, offset)

  const pubResult = await env.DB.prepare(
    `SELECT * FROM publicaciones WHERE ${conditions.join(' AND ')} ORDER BY creado_en DESC, id DESC LIMIT ? OFFSET ?`,
  )
    .bind(...params)
    .all<PublicacionRow>()

  const hasMore = pubResult.results.length > limit
  const pubs = hasMore ? pubResult.results.slice(0, limit) : pubResult.results

  if (pubs.length === 0) return { publicaciones: [], hasMore: false }

  const pubIds = pubs.map((p) => p.id)
  const placeholders = pubIds.map(() => '?').join(',')
  const contactsResult = await env.DB.prepare(
    `SELECT * FROM contactos WHERE publicacion_id IN (${placeholders}) ORDER BY id ASC`,
  )
    .bind(...pubIds)
    .all<ContactoRow>()

  const contactosByPub = new Map<number, ContactoRow[]>()
  for (const c of contactsResult.results) {
    const group = contactosByPub.get(c.publicacion_id) ?? []
    group.push(c)
    contactosByPub.set(c.publicacion_id, group)
  }

  return {
    publicaciones: pubs.map((p) => ({
      ...p,
      activo: Number(p.activo),
      contactos: contactosByPub.get(p.id) ?? [],
    })),
    hasMore,
  }
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

const CONTACT_TYPES = new Set(['instagram', 'twitter_x', 'whatsapp'])

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const { pathname } = url
  const method = request.method

  if (method === 'OPTIONS') return new Response(null, { headers: jsonHeaders })

  if (method === 'GET' && pathname === '/api/publicaciones') {
    const q = url.searchParams.get('q') ?? undefined
    const tipo = url.searchParams.get('tipo') ?? undefined
    const pais = url.searchParams.get('pais') ?? undefined
    const estado_ve = url.searchParams.get('estado_ve') ?? undefined
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? '20'), 1), 50)
    const offset = Math.max(Number(url.searchParams.get('offset') ?? '0'), 0)

    return json(await listPublicaciones(env, { q, tipo, pais, estado_ve, limit, offset }))
  }

  if (method === 'POST' && pathname === '/api/publicaciones') {
    const payload = await readJson<PublicacionInput>(request)
    if (!isValidPublicacion(payload)) {
      return json({ error: 'Título e información son requeridos' }, { status: 400 })
    }

    const passed = await verifyTurnstile(env, payload.turnstileToken, request.headers.get('CF-Connecting-IP'))
    if (!passed) {
      return json({ error: 'Verificación fallida. Recarga e intenta de nuevo.' }, { status: 403 })
    }

    const result = await env.DB.prepare(
      'INSERT INTO publicaciones (tipo, titulo, info, pais, estado_ve, ciudad) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(
        payload.tipo!,
        payload.titulo!.trim(),
        payload.info!.trim(),
        payload.pais ?? null,
        payload.estado_ve ?? null,
        payload.ciudad ?? null,
      )
      .run()

    const pubId = Number(result.meta.last_row_id)

    const validContacts = (payload.contactos ?? []).filter(
      (c): c is { tipo: string; valor: string } =>
        Boolean(c.valor?.trim()) && Boolean(c.tipo) && CONTACT_TYPES.has(c.tipo ?? ''),
    )

    if (validContacts.length > 0) {
      await env.DB.batch(
        validContacts.map((c) =>
          env.DB.prepare('INSERT INTO contactos (publicacion_id, tipo, valor) VALUES (?, ?, ?)').bind(
            pubId,
            c.tipo,
            c.valor.trim(),
          ),
        ),
      )
    }

    return json({ ok: true, id: pubId }, { status: 201 })
  }

  if (pathname.startsWith('/api/admin/')) {
    if (!requireAdmin(request, env)) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (method === 'GET' && pathname === '/api/admin/publicaciones') {
      const result = await listPublicaciones(env, { limit: 200, offset: 0, includeInactive: true })
      return json({ publicaciones: result.publicaciones })
    }

    const adminId = routeParam(pathname, '/api/admin/publicaciones/')
    if (adminId && method === 'DELETE') {
      await env.DB.prepare('UPDATE publicaciones SET activo = 0 WHERE id = ?').bind(adminId).run()
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
