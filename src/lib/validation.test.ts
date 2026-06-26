import { describe, expect, it } from 'vitest'
import { isValidPublicacion } from './validation'

const valid = { tipo: 'persona', titulo: 'Mi campaña', info: 'Cuenta bancaria 12345' }

describe('isValidPublicacion', () => {
  it('passes with tipo, titulo and info', () => {
    expect(isValidPublicacion(valid)).toBe(true)
  })

  it('passes with tipo organizacion', () => {
    expect(isValidPublicacion({ ...valid, tipo: 'organizacion' })).toBe(true)
  })

  it('fails without tipo', () => {
    expect(isValidPublicacion({ titulo: 'Mi campaña', info: 'datos' })).toBe(false)
  })

  it('fails with invalid tipo', () => {
    expect(isValidPublicacion({ ...valid, tipo: 'empresa' })).toBe(false)
  })

  it('fails without titulo', () => {
    expect(isValidPublicacion({ tipo: 'persona', info: 'datos' })).toBe(false)
  })

  it('fails without info', () => {
    expect(isValidPublicacion({ tipo: 'persona', titulo: 'Mi campaña' })).toBe(false)
  })

  it('fails with empty titulo', () => {
    expect(isValidPublicacion({ ...valid, titulo: '   ' })).toBe(false)
  })

  it('fails with empty info', () => {
    expect(isValidPublicacion({ ...valid, info: '  ' })).toBe(false)
  })

  it('fails with null', () => {
    expect(isValidPublicacion(null)).toBe(false)
  })

  it('passes with optional fields like contactos and turnstileToken', () => {
    expect(
      isValidPublicacion({
        ...valid,
        contactos: [{ tipo: 'whatsapp', valor: '123' }],
        turnstileToken: 'abc',
      }),
    ).toBe(true)
  })
})
