import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'

import type { MfaChallenge, User } from './types'

export type AuthState =
  | { status: 'restoring' }
  | { status: 'anonymous' }
  | {
      status: 'mfa-pending'
      email: string
      mfaToken: string
      challenge: MfaChallenge
    }
  | { status: 'authenticated'; accessToken: string; user: User }

const SESSION_KEY = 'alkira.session'
const MFA_KEY = 'alkira.mfa'

interface PersistedSession {
  accessToken: string
}
interface PersistedMfa {
  email: string
  mfaToken: string
  challenge: MfaChallenge
}

function readJson<T>(key: string): T | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof sessionStorage === 'undefined') return
  try {
    if (value === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function initialAuthState(): AuthState {
  const pendingMfa = readJson<PersistedMfa>(MFA_KEY)
  if (pendingMfa && Date.parse(pendingMfa.challenge.expiresAt) > Date.now()) {
    return { status: 'mfa-pending', ...pendingMfa }
  }

  const session = readJson<PersistedSession>(SESSION_KEY)
  return session ? { status: 'restoring' } : { status: 'anonymous' }
}

export const authStore = new Store<AuthState>(initialAuthState())

export function getPersistedAccessToken(): string | null {
  return readJson<PersistedSession>(SESSION_KEY)?.accessToken ?? null
}

export function getAccessToken(): string | null {
  const state = authStore.state
  if (state.status === 'authenticated') return state.accessToken
  return getPersistedAccessToken()
}

export const authActions = {
  startMfa(input: {
    email: string
    mfaToken: string
    challenge: MfaChallenge
  }) {
    writeJson(MFA_KEY, input)
    authStore.setState(() => ({ status: 'mfa-pending', ...input }))
  },

  updateChallenge(challenge: MfaChallenge) {
    authStore.setState((state) => {
      if (state.status !== 'mfa-pending') return state
      const next = { ...state, challenge }
      writeJson(MFA_KEY, {
        email: next.email,
        mfaToken: next.mfaToken,
        challenge,
      })
      return next
    })
  },

  cancelMfa() {
    writeJson(MFA_KEY, null)
    authStore.setState(() => ({ status: 'anonymous' }))
  },

  completeSignIn(input: { accessToken: string; user: User }) {
    writeJson(MFA_KEY, null)
    writeJson(SESSION_KEY, { accessToken: input.accessToken })
    authStore.setState(() => ({ status: 'authenticated', ...input }))
  },

  restored(user: User | null) {
    if (!user) {
      writeJson(SESSION_KEY, null)
      authStore.setState(() => ({ status: 'anonymous' }))
      return
    }
    const accessToken = getPersistedAccessToken()
    if (!accessToken) {
      authStore.setState(() => ({ status: 'anonymous' }))
      return
    }
    authStore.setState(() => ({ status: 'authenticated', accessToken, user }))
  },

  signOut() {
    writeJson(SESSION_KEY, null)
    writeJson(MFA_KEY, null)
    authStore.setState(() => ({ status: 'anonymous' }))
  },
}

export function resetAuthStore() {
  writeJson(SESSION_KEY, null)
  writeJson(MFA_KEY, null)
  authStore.setState(() => ({ status: 'anonymous' }))
}

export function useSessionUser(): User | null {
  return useStore(authStore, (state) =>
    state.status === 'authenticated' ? state.user : null,
  )
}

export function useCurrentUser(): User {
  const user = useSessionUser()
  if (!user) {
    throw new Error(
      'useCurrentUser() was called outside of an authenticated route.',
    )
  }
  return user
}
