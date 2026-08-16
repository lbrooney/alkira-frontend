import { Link, createFileRoute } from '@tanstack/react-router'

import { AuthLayout } from '#/components/AuthLayout'
import { SignupForm } from '#/features/auth/components/SignupForm'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  return (
    <AuthLayout
      eyebrow="Alkira Portal"
      title="Request access"
      subtitle="Tell us who you are and we will provision a tenant for your organisation."
      footer={
        <p>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-brand-500 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthLayout>
  )
}
