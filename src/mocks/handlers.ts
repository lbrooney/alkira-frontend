import { HttpResponse, delay, http } from 'msw'

import { can } from '#/features/auth/permissions'
import { validateLogin, validateSignup } from '#/features/auth/validation'
import {
  MAX_MFA_ATTEMPTS,
  MAX_PASSWORD_ATTEMPTS,
  OTP_TTL_MS,
  createChallenge,
  db,
  describeChallenge,
  findUserByEmail,
  issueSession,
  randomOtp,
  toPublicUser,
} from './db'

import type { MockUser } from './db'
import type {
  LoginResponse,
  SessionResponse,
  VerifyMfaResponse,
} from '#/features/auth/types'
import type { Connector, ConnectorPatch } from '#/features/network/types'

const READ_LATENCY_MS = 150
const WRITE_LATENCY_MS = 350

function fail(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  return HttpResponse.json({ error: { code, message, fields } }, { status })
}

function authenticate(request: Request): MockUser | null {
  const header = request.headers.get('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null

  const userId = db.sessions.get(token)
  return db.users.find((user) => user.id === userId) ?? null
}

const unauthorized = () =>
  fail(
    401,
    'UNAUTHENTICATED',
    'Your session has expired. Please sign in again.',
  )

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    const values = { email: body.email ?? '', password: body.password ?? '' }

    const fieldErrors = validateLogin(values)
    if (Object.keys(fieldErrors).length > 0) {
      await delay(WRITE_LATENCY_MS)
      return fail(
        400,
        'VALIDATION_FAILED',
        'Check the highlighted fields and try again.',
        fieldErrors,
      )
    }

    const email = values.email.trim().toLowerCase()
    const failures = db.failedLogins.get(email) ?? 0
    if (failures >= MAX_PASSWORD_ATTEMPTS) {
      await delay(WRITE_LATENCY_MS)
      return fail(
        423,
        'ACCOUNT_LOCKED',
        'Too many failed attempts. This account is locked. Contact your administrator.',
      )
    }

    const user = findUserByEmail(email)
    await delay(WRITE_LATENCY_MS)

    if (!user || user.password !== values.password) {
      db.failedLogins.set(email, failures + 1)
      return fail(
        401,
        'INVALID_CREDENTIALS',
        'That email and password combination is not recognised.',
      )
    }

    db.failedLogins.delete(email)
    const challenge = createChallenge(user)

    return HttpResponse.json<LoginResponse>({
      mfaToken: challenge.mfaToken,
      challenge: describeChallenge(user, challenge),
      devCode: challenge.code,
    })
  }),

  http.post('/api/auth/mfa/verify', async ({ request }) => {
    const body = (await request.json()) as { mfaToken?: string; code?: string }
    const challenge = body.mfaToken
      ? db.challenges.get(body.mfaToken)
      : undefined

    await delay(WRITE_LATENCY_MS)

    if (!challenge) {
      return fail(
        401,
        'CHALLENGE_NOT_FOUND',
        'This verification request is no longer valid. Please sign in again.',
      )
    }

    if (challenge.expiresAt <= Date.now()) {
      db.challenges.delete(challenge.mfaToken)
      return fail(
        410,
        'CHALLENGE_EXPIRED',
        'That code has expired. Request a new one to continue.',
      )
    }

    const user = db.users.find((candidate) => candidate.id === challenge.userId)
    if (!user) return unauthorized()

    if ((body.code ?? '').trim() !== challenge.code) {
      challenge.attemptsRemaining -= 1

      if (challenge.attemptsRemaining <= 0) {
        db.challenges.delete(challenge.mfaToken)
        return fail(
          429,
          'TOO_MANY_ATTEMPTS',
          'Too many incorrect codes. Please sign in again to restart verification.',
        )
      }

      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_CODE',
            message: `That code is not correct. ${challenge.attemptsRemaining} attempt${
              challenge.attemptsRemaining === 1 ? '' : 's'
            } remaining.`,
          },
          challenge: describeChallenge(user, challenge),
        },
        { status: 401 },
      )
    }

    db.challenges.delete(challenge.mfaToken)

    return HttpResponse.json<VerifyMfaResponse>({
      accessToken: issueSession(user),
      user: toPublicUser(user),
    })
  }),

  http.post('/api/auth/mfa/resend', async ({ request }) => {
    const body = (await request.json()) as { mfaToken?: string }
    const challenge = body.mfaToken
      ? db.challenges.get(body.mfaToken)
      : undefined

    await delay(WRITE_LATENCY_MS)

    if (!challenge) {
      return fail(
        401,
        'CHALLENGE_NOT_FOUND',
        'This verification request is no longer valid. Please sign in again.',
      )
    }

    const user = db.users.find((candidate) => candidate.id === challenge.userId)
    if (!user) return unauthorized()

    challenge.code = randomOtp()
    challenge.expiresAt = Date.now() + OTP_TTL_MS
    challenge.attemptsRemaining = MAX_MFA_ATTEMPTS

    return HttpResponse.json({
      challenge: describeChallenge(user, challenge),
      devCode: challenge.code,
    })
  }),

  http.get('/api/auth/session', async ({ request }) => {
    const user = authenticate(request)
    await delay(READ_LATENCY_MS)
    if (!user) return unauthorized()
    return HttpResponse.json<SessionResponse>({ user: toPublicUser(user) })
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    const header = request.headers.get('Authorization')
    if (header?.startsWith('Bearer ')) db.sessions.delete(header.slice(7))
    await delay(READ_LATENCY_MS)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/auth/signup', async ({ request }) => {
    const body = (await request.json()) as Record<string, string | undefined>
    const values = {
      name: body.name ?? '',
      company: body.company ?? '',
      email: body.email ?? '',
      password: body.password ?? '',
      confirmPassword: body.confirmPassword ?? '',
    }

    const fieldErrors = validateSignup(values)
    await delay(WRITE_LATENCY_MS)

    if (Object.keys(fieldErrors).length > 0) {
      return fail(
        400,
        'VALIDATION_FAILED',
        'Check the highlighted fields and try again.',
        fieldErrors,
      )
    }

    if (findUserByEmail(values.email)) {
      return fail(
        409,
        'EMAIL_TAKEN',
        'An account already exists for that email address.',
        { email: 'An account already exists for that email address.' },
      )
    }

    return HttpResponse.json(
      {
        message:
          'Thanks. Your request is with the Alkira team. We will email you once your tenant is provisioned.',
      },
      { status: 201 },
    )
  }),
]

export const networkHandlers = [
  http.get('/api/network/connectors', async ({ request }) => {
    const user = authenticate(request)
    await delay(READ_LATENCY_MS)
    if (!user) return unauthorized()

    return HttpResponse.json<{ connectors: Connector[] }>({
      connectors: db.connectors,
    })
  }),

  http.patch('/api/network/connectors/:id', async ({ request, params }) => {
    const user = authenticate(request)
    if (!user) return unauthorized()

    if (!can(user, 'connector:update')) {
      await delay(WRITE_LATENCY_MS)
      return fail(
        403,
        'FORBIDDEN',
        'Your role does not allow changes to connectors.',
      )
    }

    const connector = db.connectors.find(
      (candidate) => candidate.id === params.id,
    )
    if (!connector) {
      await delay(WRITE_LATENCY_MS)
      return fail(404, 'NOT_FOUND', 'That connector no longer exists.')
    }

    const patch = (await request.json()) as ConnectorPatch
    await delay(WRITE_LATENCY_MS)

    if (patch.name !== undefined) {
      const name = patch.name.trim()
      if (!/^[a-z0-9-]{3,40}$/.test(name)) {
        return fail(
          400,
          'VALIDATION_FAILED',
          'Check the highlighted fields and try again.',
          {
            name: 'Use 3–40 lowercase letters, numbers or hyphens.',
          },
        )
      }
      connector.name = name
    }

    if (patch.segment !== undefined) connector.segment = patch.segment
    if (patch.enabled !== undefined) {
      connector.enabled = patch.enabled
      connector.state = patch.enabled ? 'ACTIVE' : 'DOWN'
    }
    connector.updatedAt = new Date().toISOString()

    return HttpResponse.json<Connector>(connector)
  }),
]

export const handlers = [...authHandlers, ...networkHandlers]
