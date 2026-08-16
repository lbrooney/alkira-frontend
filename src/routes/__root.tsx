import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { BrandMark } from '#/components/BrandMark'
import TanStackQueryDevtools from '#/integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
})

const SHOW_DEVTOOLS = import.meta.env.DEV && import.meta.env.MODE !== 'test'

function RootComponent() {
  return (
    <>
      <Outlet />
      {SHOW_DEVTOOLS ? (
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
      ) : null}
    </>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <BrandMark />
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-steel-500 uppercase">
          404
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink-900">
          We could not find that page
        </h1>
      </div>
      <Link
        to="/login"
        className="rounded-control bg-brand-500 px-5 py-2.5 text-sm font-medium text-white
          transition-colors hover:bg-brand-600"
      >
        Go to the portal
      </Link>
    </div>
  )
}
