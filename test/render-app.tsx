import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { restoreSession } from '#/features/auth/restore'
import { createRouter } from '#/router'

export async function renderApp(initialPath = '/login') {
  const { router, queryClient, dispose } = createRouter({
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  await restoreSession(queryClient)

  await router.load()

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return {
    ...utils,
    router,
    queryClient,
    dispose,
    user: userEvent.setup(),
    currentPath: () => router.state.location.pathname,
  }
}
