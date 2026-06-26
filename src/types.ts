export type ContactoTipo = 'instagram' | 'twitter_x' | 'whatsapp'

export interface Contacto {
  id: number
  tipo: ContactoTipo
  valor: string
}

export type PublicacionTipo = 'persona' | 'organizacion'

export interface Publicacion {
  id: number
  tipo: PublicacionTipo
  titulo: string
  info: string
  pais: string | null
  estado_ve: string | null
  ciudad: string | null
  activo: number
  creado_en: string
  contactos: Contacto[]
}

export interface PublicacionesResponse {
  publicaciones: Publicacion[]
  hasMore: boolean
}
