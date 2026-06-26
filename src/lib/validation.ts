const TIPOS_VALIDOS = new Set(['persona', 'organizacion'])

export function isValidPublicacion(
  payload: unknown,
): payload is { tipo: string; titulo: string; info: string; contactos?: unknown[]; turnstileToken?: string } {
  if (!payload || typeof payload !== 'object') return false
  const p = payload as Record<string, unknown>
  return (
    typeof p.tipo === 'string' &&
    TIPOS_VALIDOS.has(p.tipo) &&
    typeof p.titulo === 'string' &&
    p.titulo.trim().length > 0 &&
    typeof p.info === 'string' &&
    p.info.trim().length > 0
  )
}
