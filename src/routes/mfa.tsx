import { createFileRoute, redirect } from '@tanstack/react-router'

import { AuthLayout } from '#/components/AuthLayout'
import { authStore } from '#/features/auth/auth-store'
import { MfaForm } from '#/features/auth/components/MfaForm'
import { validateAuthSearch } from '#/features/auth/search-schema'

export const Route = createFileRoute('/mfa')({
  validateSearch: validateAuthSearch,
  beforeLoad: ({ search }) => {
    const state = authStore.state

    if (state.status === 'authenticated') {
      throw redirect({ href: search.redirect ?? '/' })
    }
    if (state.status !== 'mfa-pending') {
      throw redirect({ to: '/login', search: { redirect: search.redirect } })
    }

    return { challengeState: state }
  },
  component: MfaPage,
})

function MfaPage() {
  const { challengeState } = Route.useRouteContext()
  const { redirect: redirectTo } = Route.useSearch()

  return (
    <AuthLayout
      eyebrow="Step 2 of 2"
      title="Two-factor verification"
      subtitle={
        <>
          Signing in as{' '}
          <span className="font-mono text-ink-800">{challengeState.email}</span>
        </>
      }
    >
      <MfaForm
        email={challengeState.email}
        mfaToken={challengeState.mfaToken}
        challenge={challengeState.challenge}
        redirect={redirectTo}
      />
    </AuthLayout>
  )
}
