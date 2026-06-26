export type EntryType = 'persona' | 'organizacion'

export type MethodType =
  | 'banco_ve'
  | 'banco_us'
  | 'banco_cl'
  | 'paypal'
  | 'zelle'
  | 'binance'
  | 'venmo'
  | 'pago_movil'
  | 'donorbox'
  | 'globalgiving'
  | 'gofundme'
  | 'whatsapp'
  | 'otro'

export interface PaymentMethod {
  id: number
  entrada_id: number
  tipo: MethodType
  pais: string | null
  detalle: string
  moneda: string | null
}

export interface Entry {
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
  metodos: PaymentMethod[]
}

export interface Solicitud {
  id: number
  nombre: string
  campana: string | null
  tipo: EntryType
  descripcion: string | null
  verificacion_url: string | null
  contacto: string | null
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  creado_en: string
}

export type Lang = 'es' | 'en'

export interface MethodDraft {
  tipo: MethodType
  pais: string
  detalle: string
  moneda: string
}

export interface EntryDraft {
  tipo: EntryType
  nombre: string
  campana: string
  descripcion_es: string
  descripcion_en: string
  verificacion_url: string
  destacado: number
  metodos: MethodDraft[]
}

export interface SolicitudDraft {
  nombre: string
  campana: string
  tipo: EntryType
  descripcion: string
  verificacion_url: string
  contacto: string
}

export interface Filters {
  type: 'all' | EntryType
  method: 'all' | MethodType
  currency: 'all' | string
}
