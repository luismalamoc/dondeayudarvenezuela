import type { Entry, Filters, Lang, MethodType, PaymentMethod } from '../types'

/** Agrupa los metodos de pago por su tipo, preservando el orden de aparicion. */
export function groupMethods(methods: PaymentMethod[]): Map<MethodType, PaymentMethod[]> {
  const groups = new Map<MethodType, PaymentMethod[]>()
  for (const method of methods) {
    const current = groups.get(method.tipo) ?? []
    current.push(method)
    groups.set(method.tipo, current)
  }
  return groups
}

/** Devuelve la descripcion segun el idioma activo, con respaldo al otro idioma. */
export function entryDescription(entry: Entry, lang: Lang): string {
  const value =
    lang === 'en' ? entry.descripcion_en || entry.descripcion_es : entry.descripcion_es || entry.descripcion_en
  return value ?? ''
}

/** Indica si una entrada cumple con los filtros activos. */
export function entryMatchesFilters(entry: Entry, filters: Filters): boolean {
  const methods = entry.metodos
  const typeMatches = filters.type === 'all' || entry.tipo === filters.type
  const methodMatches = filters.method === 'all' || methods.some((method) => method.tipo === filters.method)
  const currencyMatches = filters.currency === 'all' || methods.some((method) => method.moneda === filters.currency)
  return typeMatches && methodMatches && currencyMatches
}

/** Filtra la lista de entradas con los filtros activos. */
export function filterEntries(entries: Entry[], filters: Filters): Entry[] {
  return entries.filter((entry) => entryMatchesFilters(entry, filters))
}
