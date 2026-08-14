import { queryOptions } from '@tanstack/react-query'

import { apiFetch } from '#/lib/api-client'

import type {
  LoginResponse,
  MfaChallenge,
  SessionResponse,
  VerifyMfaResponse,
} from './types'
import type { LoginValues, SignupValues } from './validation'

export const authKeys = {
  session: ['auth', 'session'] as const,
}

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.session,
    queryFn: () => apiFetch<SessionResponse>('/api/auth/session'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

export function login(values: LoginValues) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    json: { email: values.email.trim(), password: values.password },
  })
}

export function verifyMfa(input: { mfaToken: string; code: string }) {
  return apiFetch<VerifyMfaResponse>('/api/auth/mfa/verify', {
    method: 'POST',
    json: { mfaToken: input.mfaToken, code: input.code.trim() },
  })
}

export function resendMfa(input: { mfaToken: string }) {
  return apiFetch<{ challenge: MfaChallenge; devCode: string }>(
    '/api/auth/mfa/resend',
    { method: 'POST', json: input },
  )
}

export function logout() {
  return apiFetch<void>('/api/auth/logout', { method: 'POST' })
}

export function signup(values: SignupValues) {
  return apiFetch<{ message: string }>('/api/auth/signup', {
    method: 'POST',
    json: {
      name: values.name.trim(),
      company: values.company.trim(),
      email: values.email.trim(),
      password: values.password,
      confirmPassword: values.confirmPassword,
    },
  })
}
