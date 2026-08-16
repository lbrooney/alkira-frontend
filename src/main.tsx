import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { restoreSession } from '#/features/auth/restore'
import { createRouter } from '#/router'
import './styles.css'

async function startMockApi() {
  const { worker } = await import('#/mocks/browser')
  await worker.start({
    quiet: true,
    onUnhandledRequest: 'bypass',
  })
}

async function bootstrap() {
  await startMockApi()

  const { router, queryClient } = createRouter()

  await restoreSession(queryClient)

  const container = document.getElementById('app')
  if (!container) throw new Error('Root container #app is missing.')

  createRoot(container).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
