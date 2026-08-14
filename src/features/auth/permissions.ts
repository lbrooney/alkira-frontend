import type { Role, User } from './types'

export const PERMISSIONS = [
  'connector:read',
  'connector:update',
  'connector:create',
  'connector:delete',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  'network-admin': [
    'connector:read',
    'connector:update',
    'connector:create',
    'connector:delete',
  ],
  'read-only': ['connector:read'],
}

export const ROLE_LABELS: Record<Role, string> = {
  'network-admin': 'Network Admin',
  'read-only': 'Read Only',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  'network-admin':
    'Full read/write access. Can create, edit, enable and delete connectors.',
  'read-only':
    'View-only access. Edit actions are disabled and rejected by the API.',
}

export function permissionsFor(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role]
}

export function can(
  user: Pick<User, 'role'> | null | undefined,
  permission: Permission,
): boolean {
  if (!user) return false
  return ROLE_PERMISSIONS[user.role].includes(permission)
}

export function isReadOnly(user: Pick<User, 'role'> | null | undefined) {
  return !can(user, 'connector:update') && !can(user, 'connector:create')
}
