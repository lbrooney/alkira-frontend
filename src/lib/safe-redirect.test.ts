import { describe, expect, it } from 'vitest'

import { safeInternalPath } from './safe-redirect'

describe('safeInternalPath', () => {
  it('keeps same-origin paths', () => {
    expect(safeInternalPath('/account')).toBe('/account')
    expect(safeInternalPath('/?tab=1')).toBe('/?tab=1')
  })

  it.each([
    'https://evil.example.com',
    '//evil.example.com',
    'javascript:alert(1)',
    '/\\evil.example.com',
    'account',
    '',
  ])('rejects %j', (value) => {
    expect(safeInternalPath(value)).toBeUndefined()
  })

  it('rejects non-strings', () => {
    expect(safeInternalPath(undefined)).toBeUndefined()
    expect(safeInternalPath(42)).toBeUndefined()
    expect(safeInternalPath(['/account'])).toBeUndefined()
  })
})
