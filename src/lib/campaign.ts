import type { ContactoTipo } from '../types'

export interface ContactoDraft {
  tipo: ContactoTipo
  valor: string
}

export interface CampaignFormValue {
  tipo: '' | 'persona' | 'organizacion'
  titulo: string
  info: string
  pais: string
  estadoVe: string
  ciudad: string
  contactos: ContactoDraft[]
}

export const EMPTY_CAMPAIGN: CampaignFormValue = {
  tipo: '',
  titulo: '',
  info: '',
  pais: '',
  estadoVe: '',
  ciudad: '',
  contactos: [],
}
