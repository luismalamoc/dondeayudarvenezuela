import type { EntryType } from '../types'

export interface EntryValidationInput {
  tipo?: string
  nombre?: string
}

export interface SolicitudValidationInput {
  nombre?: string
  tipo?: string
  verificacion_url?: string
  contacto?: string
}

export function isEntryType(value: unknown): value is EntryType {
  return value === 'persona' || value === 'organizacion'
}

/** Una entrada es valida si tiene nombre y un tipo permitido. */
export function isValidEntry(payload: EntryValidationInput | null | undefined): boolean {
  return Boolean(payload?.nombre) && isEntryType(payload?.tipo)
}

/** Una solicitud es valida con nombre, tipo permitido, verificacion y contacto. */
export function isValidSolicitud(payload: SolicitudValidationInput | null | undefined): boolean {
  return Boolean(payload?.nombre && isEntryType(payload?.tipo) && payload?.verificacion_url && payload?.contacto)
}
