export interface Currency {
  code: string
  /** ISO 3166-1 alpha-2 country code, or 'INT' for supranational currencies. */
  pais: string
  nombre_es: string
  nombre_en: string
}

/**
 * Monedas soportadas: todos los paises de Latinoamerica, mas el Euro (EUR)
 * y el dolar estadounidense (USD).
 */
export const CURRENCIES: Currency[] = [
  { code: 'USD', pais: 'US', nombre_es: 'Dolar estadounidense', nombre_en: 'US Dollar' },
  { code: 'EUR', pais: 'INT', nombre_es: 'Euro', nombre_en: 'Euro' },
  { code: 'VES', pais: 'VE', nombre_es: 'Bolivar venezolano', nombre_en: 'Venezuelan Bolivar' },
  { code: 'ARS', pais: 'AR', nombre_es: 'Peso argentino', nombre_en: 'Argentine Peso' },
  { code: 'BOB', pais: 'BO', nombre_es: 'Boliviano', nombre_en: 'Bolivian Boliviano' },
  { code: 'BRL', pais: 'BR', nombre_es: 'Real brasileno', nombre_en: 'Brazilian Real' },
  { code: 'CLP', pais: 'CL', nombre_es: 'Peso chileno', nombre_en: 'Chilean Peso' },
  { code: 'COP', pais: 'CO', nombre_es: 'Peso colombiano', nombre_en: 'Colombian Peso' },
  { code: 'CRC', pais: 'CR', nombre_es: 'Colon costarricense', nombre_en: 'Costa Rican Colon' },
  { code: 'CUP', pais: 'CU', nombre_es: 'Peso cubano', nombre_en: 'Cuban Peso' },
  { code: 'DOP', pais: 'DO', nombre_es: 'Peso dominicano', nombre_en: 'Dominican Peso' },
  { code: 'GTQ', pais: 'GT', nombre_es: 'Quetzal guatemalteco', nombre_en: 'Guatemalan Quetzal' },
  { code: 'HNL', pais: 'HN', nombre_es: 'Lempira hondureno', nombre_en: 'Honduran Lempira' },
  { code: 'MXN', pais: 'MX', nombre_es: 'Peso mexicano', nombre_en: 'Mexican Peso' },
  { code: 'NIO', pais: 'NI', nombre_es: 'Cordoba nicaraguense', nombre_en: 'Nicaraguan Cordoba' },
  { code: 'PAB', pais: 'PA', nombre_es: 'Balboa panameno', nombre_en: 'Panamanian Balboa' },
  { code: 'PYG', pais: 'PY', nombre_es: 'Guarani paraguayo', nombre_en: 'Paraguayan Guarani' },
  { code: 'PEN', pais: 'PE', nombre_es: 'Sol peruano', nombre_en: 'Peruvian Sol' },
  { code: 'UYU', pais: 'UY', nombre_es: 'Peso uruguayo', nombre_en: 'Uruguayan Peso' },
]

export const CURRENCY_CODES: string[] = CURRENCIES.map((currency) => currency.code)

const CURRENCY_BY_CODE = new Map<string, Currency>(CURRENCIES.map((currency) => [currency.code, currency]))

export function isSupportedCurrency(code: string): boolean {
  return CURRENCY_BY_CODE.has(code)
}

export function getCurrency(code: string): Currency | undefined {
  return CURRENCY_BY_CODE.get(code)
}

export function currencyLabel(code: string, lang: 'es' | 'en'): string {
  const currency = CURRENCY_BY_CODE.get(code)
  if (!currency) return code
  return lang === 'en' ? currency.nombre_en : currency.nombre_es
}
