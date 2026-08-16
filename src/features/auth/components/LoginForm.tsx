import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '#/components/ui/Button'
import { Callout } from '#/components/ui/Callout'
import { TextField } from '#/components/ui/TextField'
import { ApiError } from '#/lib/api-client'
import { useForm } from '#/lib/use-form'
import { DemoAccounts } from '#/mocks/DemoAccounts'
import { setDemoCode } from '#/mocks/demo-code-store'
import { login } from '../api'
import { authActions } from '../auth-store'
import { validateLogin } from '../validation'

import type { LoginField, LoginValues } from '../validation'

const INITIAL: LoginValues = { email: '', password: '' }

export function LoginForm({ redirect }: { redirect?: string }) {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginValues, LoginField>({
    initialValues: INITIAL,
    validate: validateLogin,
    onSubmit: async (values, { setServerErrors }) => {
      setFormError(null)
      try {
        const result = await login(values)

        authActions.startMfa({
          email: values.email.trim(),
          mfaToken: result.mfaToken,
          challenge: result.challenge,
        })
        setDemoCode(result.devCode)

        await navigate({ to: '/mfa', search: { redirect } })
      } catch (error) {
        if (error instanceof ApiError && error.fields) {
          setServerErrors(error.fields)
          return
        }
        setFormError(
          error instanceof ApiError
            ? error.message
            : 'We could not reach the authentication service. Check your connection and try again.',
        )
      }
    },
  })

  return (
    <form
      onSubmit={form.handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      {formError ? (
        <Callout tone="danger" role="alert" title="Sign-in failed">
          {formError}
        </Callout>
      ) : null}

      <TextField
        label="Work email"
        type="email"
        name="email"
        autoComplete="username"
        placeholder="name@company.com"
        autoFocus
        value={form.values.email}
        error={form.errors.email}
        onChange={(event) => form.setField('email', event.target.value)}
        onBlur={() => form.handleBlur('email')}
      />

      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        autoComplete="current-password"
        placeholder="••••••••••"
        value={form.values.password}
        error={form.errors.password}
        onChange={(event) => form.setField('password', event.target.value)}
        onBlur={() => form.handleBlur('password')}
        adornment={
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="rounded-control px-2 py-1 text-xs font-medium text-steel-500 hover:text-brand-500"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        }
      />

      <Button type="submit" size="lg" fullWidth loading={form.submitting}>
        {form.submitting ? 'Verifying…' : 'Continue'}
      </Button>

      <DemoAccounts
        onUse={({ email, password }) => {
          form.setField('email', email)
          form.setField('password', password)
        }}
      />
    </form>
  )
}
