import { describe, it, expect } from 'vitest'
import { ESTADOS_VENEZUELA } from './venezuela'

describe('ESTADOS_VENEZUELA', () => {
  it('has 25 entries', () => {
    expect(ESTADOS_VENEZUELA).toHaveLength(25)
  })

  it('includes key states', () => {
    expect(ESTADOS_VENEZUELA).toContain('Distrito Capital')
    expect(ESTADOS_VENEZUELA).toContain('Miranda')
    expect(ESTADOS_VENEZUELA).toContain('Zulia')
    expect(ESTADOS_VENEZUELA).toContain('La Guaira')
  })

  it('has no duplicates', () => {
    expect(new Set(ESTADOS_VENEZUELA).size).toBe(ESTADOS_VENEZUELA.length)
  })
})
