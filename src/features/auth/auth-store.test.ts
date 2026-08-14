import { beforeEach, describe, expect, it } from 'vitest'

import {
  authActions,
  authStore,
  getAccessToken,
  initialAuthState,
  resetAuthStore,
} from './auth-store'

import type { MfaChallenge, User } from './types'

const user: User = {
  id: 'usr_admin',
  name: 'Ada Okonkwo',
  email: 'admin@alkira.com',
  role: 'network-admin',
  tenant: 'Northwind Logistics',
  jobTitle: 'Principal Network Architect',
}

function challenge(expiresInMs: number): MfaChallenge {
  return {
    method: 'authenticator',
    destination: 'Alkira Authenticator',
    digits: 6,
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    attemptsRemaining: 5,
  }
}

beforeEach(() => {
  sessionStorage.clear()
  resetAuthStore()
})

describe('authStore', () => {
  it('starts anonymous with nothing persisted', () => {
    expect(authStore.state.status).toBe('anonymous')
    expect(getAccessToken()).toBeNull()
  })

  it('moves to mfa-pending and persists the challenge', () => {
    authActions.startMfa({
      email: 'admin@alkira.com',
      mfaToken: 'mfa_1',
      challenge: challenge(60_000),
    })

    expect(authStore.state).toMatchObject({
      status: 'mfa-pending',
      email: 'admin@alkira.com',
      mfaToken: 'mfa_1',
    })
    expect(sessionStorage.getItem('alkira.mfa')).toContain('mfa_1')
  })

  it('rehydrates an unexpired challenge so a page reload keeps the flow', () => {
    authActions.startMfa({
      email: 'admin@alkira.com',
      mfaToken: 'mfa_1',
      challenge: challenge(60_000),
    })

    expect(initialAuthState()).toMatchObject({ status: 'mfa-pending' })
  })

  it('discards an expired challenge on rehydrate', () => {
    authActions.startMfa({
      email: 'admin@alkira.com',
      mfaToken: 'mfa_1',
      challenge: challenge(-1_000),
    })

    expect(initialAuthState()).toEqual({ status: 'anonymous' })
  })

  it('authenticates and exposes the token to the HTTP layer', () => {
    authActions.completeSignIn({ accessToken: 'tok_1', user })

    expect(authStore.state).toEqual({
      status: 'authenticated',
      accessToken: 'tok_1',
      user,
    })
    expect(getAccessToken()).toBe('tok_1')
    expect(sessionStorage.getItem('alkira.mfa')).toBeNull()
  })

  it('reports "restoring" when only a token survives a reload', () => {
    authActions.completeSignIn({ accessToken: 'tok_1', user })
    expect(initialAuthState()).toEqual({ status: 'restoring' })
  })

  it('drops the persisted token when restore finds no user', () => {
    authActions.completeSignIn({ accessToken: 'tok_1', user })
    authActions.restored(null)

    expect(authStore.state).toEqual({ status: 'anonymous' })
    expect(sessionStorage.getItem('alkira.session')).toBeNull()
  })

  it('clears everything on sign out', () => {
    authActions.completeSignIn({ accessToken: 'tok_1', user })
    authActions.signOut()

    expect(authStore.state).toEqual({ status: 'anonymous' })
    expect(getAccessToken()).toBeNull()
    expect(sessionStorage.getItem('alkira.session')).toBeNull()
  })

  it('keeps the challenge in sync when attempts are consumed', () => {
    authActions.startMfa({
      email: 'admin@alkira.com',
      mfaToken: 'mfa_1',
      challenge: challenge(60_000),
    })
    authActions.updateChallenge({ ...challenge(60_000), attemptsRemaining: 2 })

    expect(authStore.state).toMatchObject({
      status: 'mfa-pending',
      challenge: { attemptsRemaining: 2 },
    })
  })

  it('ignores challenge updates when no challenge is in flight', () => {
    authActions.updateChallenge(challenge(60_000))
    expect(authStore.state).toEqual({ status: 'anonymous' })
  })
})
