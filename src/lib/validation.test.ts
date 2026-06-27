import { describe, it, expect } from 'vitest'
import { isEntryType, isValidEntry, isValidSolicitud } from './validation'

describe('isEntryType', () => {
  it('accepts persona and organizacion', () => {
    expect(isEntryType('persona')).toBe(true)
    expect(isEntryType('organizacion')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isEntryType('org')).toBe(false)
    expect(isEntryType('')).toBe(false)
    expect(isEntryType(null)).toBe(false)
    expect(isEntryType(undefined)).toBe(false)
  })
})

describe('isValidEntry', () => {
  it('passes with nombre and valid tipo', () => {
    expect(isValidEntry({ nombre: 'Cruz Roja', tipo: 'organizacion' })).toBe(true)
    expect(isValidEntry({ nombre: 'Juan', tipo: 'persona' })).toBe(true)
  })

  it('fails without nombre', () => {
    expect(isValidEntry({ nombre: '', tipo: 'persona' })).toBe(false)
    expect(isValidEntry({ tipo: 'persona' })).toBe(false)
  })

  it('fails with invalid tipo', () => {
    expect(isValidEntry({ nombre: 'Juan', tipo: 'ong' })).toBe(false)
  })

  it('fails with null or undefined', () => {
    expect(isValidEntry(null)).toBe(false)
    expect(isValidEntry(undefined)).toBe(false)
  })
})

describe('isValidSolicitud', () => {
  const valid = {
    nombre: 'Cruz Roja',
    tipo: 'organizacion',
    verificacion_url: 'https://instagram.com/cruzroja',
    contacto: 'cruzroja@example.com',
  }

  it('passes with all required fields', () => {
    expect(isValidSolicitud(valid)).toBe(true)
  })

  it('fails when any required field is missing', () => {
    expect(isValidSolicitud({ ...valid, nombre: '' })).toBe(false)
    expect(isValidSolicitud({ ...valid, tipo: 'otro' })).toBe(false)
    expect(isValidSolicitud({ ...valid, verificacion_url: '' })).toBe(false)
    expect(isValidSolicitud({ ...valid, contacto: '' })).toBe(false)
  })

  it('fails with null or undefined', () => {
    expect(isValidSolicitud(null)).toBe(false)
    expect(isValidSolicitud(undefined)).toBe(false)
  })
})
