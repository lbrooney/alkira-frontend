import { describe, expect, it } from 'vitest'

import { PERMISSIONS, can, isReadOnly, permissionsFor } from './permissions'

import type { Role } from './types'

const admin = { role: 'network-admin' as Role }
const viewer = { role: 'read-only' as Role }

describe('permissions', () => {
  it('grants every permission to a network admin', () => {
    for (const permission of PERMISSIONS) {
      expect(can(admin, permission)).toBe(true)
    }
  })

  it('grants only reads to a read-only user', () => {
    expect(can(viewer, 'connector:read')).toBe(true)
    expect(can(viewer, 'connector:update')).toBe(false)
    expect(can(viewer, 'connector:create')).toBe(false)
    expect(can(viewer, 'connector:delete')).toBe(false)
  })

  it('denies everything without a user', () => {
    expect(can(null, 'connector:read')).toBe(false)
    expect(can(undefined, 'connector:update')).toBe(false)
  })

  it('classifies read-only as read-only and admin as not', () => {
    expect(isReadOnly(viewer)).toBe(true)
    expect(isReadOnly(admin)).toBe(false)
    expect(isReadOnly(null)).toBe(true)
  })

  it('never lets a role reference a permission that does not exist', () => {
    for (const role of ['network-admin', 'read-only'] as Role[]) {
      for (const permission of permissionsFor(role)) {
        expect(PERMISSIONS).toContain(permission)
      }
    }
  })
})
