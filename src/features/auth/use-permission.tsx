import { useStore } from '@tanstack/react-store'

import { authStore } from './auth-store'
import { can } from './permissions'

import type { Permission } from './permissions'

export function usePermission(permission: Permission): boolean {
  return useStore(authStore, (state) =>
    state.status === 'authenticated' ? can(state.user, permission) : false,
  )
}
