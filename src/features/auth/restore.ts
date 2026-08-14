import { sessionQueryOptions } from './api'
import { authActions, authStore } from './auth-store'

import type { QueryClient } from '@tanstack/react-query'

export async function restoreSession(queryClient: QueryClient): Promise<void> {
  if (authStore.state.status !== 'restoring') return

  try {
    const { user } = await queryClient.fetchQuery(sessionQueryOptions())
    authActions.restored(user)
  } catch {
    authActions.restored(null)
  }
}
