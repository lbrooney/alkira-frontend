import { Link, createFileRoute, redirect } from '@tanstack/react-router'

import { AuthLayout } from '#/components/AuthLayout'
import { authStore } from '#/features/auth/auth-store'
import { LoginForm } from '#/features/auth/components/LoginForm'
import { validateAuthSearch } from '#/features/auth/search-schema'

export const Route = createFileRoute('/login')({
  validateSearch: validateAuthSearch,
  beforeLoad: ({ search }) => {
    const state = authStore.state

    if (state.status === 'authenticated') {
      throw redirect({ href: search.redirect ?? '/' })
    }
    if (state.status === 'mfa-pending') {
      throw redirect({ to: '/mfa', search: { redirect: search.redirect } })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch()

  return (
    <AuthLayout
      eyebrow="Alkira Portal"
      title="Sign in"
      subtitle="Use your organisation credentials. You will confirm with a second factor on the next step."
      footer={
        <p>
          No account yet?{' '}
          <Link
            to="/signup"
            className="font-medium text-brand-500 underline-offset-4 hover:underline"
          >
            Request access
          </Link>
        </p>
      }
    >
      <LoginForm redirect={redirectTo} />
    </AuthLayout>
  )
}
