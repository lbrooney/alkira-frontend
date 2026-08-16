import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AppShell } from '#/components/AppShell'
import { authStore } from '#/features/auth/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const state = authStore.state

    if (state.status !== 'authenticated') {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    return { user: state.user }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
