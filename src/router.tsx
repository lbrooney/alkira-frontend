import { QueryClient } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { authStore } from '#/features/auth/auth-store'
import { routeTree } from './routeTree.gen'

import type { RouterHistory } from '@tanstack/react-router'

export interface CreateRouterOptions {
  history?: RouterHistory
}

export function createRouter({ history }: CreateRouterOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    ...(history ? { history } : {}),
  })

  const unsubscribe = authStore.subscribe(() => {
    void router.invalidate()
  })

  return { router, queryClient, dispose: unsubscribe }
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>['router']
  }
}
