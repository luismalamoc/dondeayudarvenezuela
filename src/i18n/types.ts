import type { Lang, MethodType } from '../types'

export interface Dictionary {
  lang: Lang
  meta: { title: string }
  nav: { title: string; admin: string; public: string }
  hero: { eyebrow: string; title: string; body: string; submit: string }
  disclaimer: string
  loading: string
  filters: {
    title: string
    type: string
    method: string
    currency: string
    all: string
    personas: string
    organizaciones: string
    clear: string
  }
  entry: {
    persona: string
    organizacion: string
    campaign: string
    featured: string
    verify: string
    methods: string
    noMethods: string
  }
  submit: {
    title: string
    body: string
    name: string
    campaign: string
    type: string
    description: string
    verification: string
    contact: string
    send: string
    sending: string
    success: string
    error: string
    dm: string
  }
  admin: {
    title: string
    secret: string
    enter: string
    logout: string
    entries: string
    requests: string
    newEntry: string
    addMethod: string
    save: string
    create: string
    deactivate: string
    remove: string
    approve: string
    reject: string
    empty: string
    country: string
    currencyField: string
    detail: string
    entryPlaceholder: string
    campaign: string
  }
  methodLabels: Record<MethodType, string>
}
