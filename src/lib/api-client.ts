import { getAccessToken } from '#/features/auth/auth-store'

import type { MfaChallenge } from '#/features/auth/types'

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
  challenge?: MfaChallenge
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>
  readonly challenge?: MfaChallenge

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: Record<string, string>,
    challenge?: MfaChallenge,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
    this.challenge = challenge
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  json?: unknown
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  if (typeof location === 'undefined') return path
  return new URL(path, location.origin).toString()
}

export async function apiFetch<TResult>(
  path: string,
  { json, headers, ...init }: RequestOptions = {},
): Promise<TResult> {
  const token = getAccessToken()

  const response = await fetch(resolveUrl(path), {
    ...init,
    headers: {
      ...(json === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(json === undefined ? {} : { body: JSON.stringify(json) }),
  })

  if (response.status === 204) return undefined as TResult

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const body = payload as ApiErrorBody | null
    throw new ApiError(
      response.status,
      body?.error.code ?? 'UNKNOWN',
      body?.error.message ?? 'Something went wrong. Please try again.',
      body?.error.fields,
      body?.challenge,
    )
  }

  return payload as TResult
}
