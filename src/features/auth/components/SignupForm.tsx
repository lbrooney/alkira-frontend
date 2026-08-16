import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/Button'
import { Callout } from '#/components/ui/Callout'
import { TextField } from '#/components/ui/TextField'
import { ApiError } from '#/lib/api-client'
import { useForm } from '#/lib/use-form'
import { signup } from '../api'
import { MIN_PASSWORD_LENGTH, validateSignup } from '../validation'

import type { SignupField, SignupValues } from '../validation'

const INITIAL: SignupValues = {
  name: '',
  company: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function SignupForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const [submittedTo, setSubmittedTo] = useState<string | null>(null)

  const form = useForm<SignupValues, SignupField>({
    initialValues: INITIAL,
    validate: validateSignup,
    onSubmit: async (values, { setServerErrors }) => {
      setFormError(null)
      try {
        await signup(values)
        setSubmittedTo(values.email.trim())
      } catch (error) {
        if (error instanceof ApiError && error.fields) {
          setServerErrors(error.fields)
          return
        }
        setFormError(
          error instanceof ApiError
            ? error.message
            : 'We could not submit your request. Please try again.',
        )
      }
    },
  })

  if (submittedTo) {
    return (
      <div className="flex flex-col gap-6">
        <Callout tone="success" title="Request received">
          We have sent a confirmation to{' '}
          <span className="font-mono">{submittedTo}</span>. An Alkira
          administrator will provision your tenant and email you an activation
          link.
        </Callout>
        <Link
          to="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-control border
            border-brand-500 bg-white text-[15px] font-medium text-brand-500
            transition-colors hover:bg-brand-50"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      {formError ? (
        <Callout tone="danger" role="alert" title="Sign-up failed">
          {formError}
        </Callout>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Ada Okonkwo"
          autoFocus
          value={form.values.name}
          error={form.errors.name}
          onChange={(event) => form.setField('name', event.target.value)}
          onBlur={() => form.handleBlur('name')}
        />
        <TextField
          label="Company"
          name="company"
          autoComplete="organization"
          placeholder="Northwind Logistics"
          value={form.values.company}
          error={form.errors.company}
          onChange={(event) => form.setField('company', event.target.value)}
          onBlur={() => form.handleBlur('company')}
        />
      </div>

      <TextField
        label="Work email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="name@company.com"
        value={form.values.email}
        error={form.errors.email}
        onChange={(event) => form.setField('email', event.target.value)}
        onBlur={() => form.handleBlur('email')}
      />

      <TextField
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters, with upper and lower case letters and a number.`}
        value={form.values.password}
        error={form.errors.password}
        onChange={(event) => form.setField('password', event.target.value)}
        onBlur={() => form.handleBlur('password')}
      />

      <TextField
        label="Confirm password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        value={form.values.confirmPassword}
        error={form.errors.confirmPassword}
        onChange={(event) =>
          form.setField('confirmPassword', event.target.value)
        }
        onBlur={() => form.handleBlur('confirmPassword')}
      />

      <Button type="submit" size="lg" fullWidth loading={form.submitting}>
        {form.submitting ? 'Submitting…' : 'Request access'}
      </Button>
    </form>
  )
}
