export type Role = 'network-admin' | 'read-only'

export type MfaMethod = 'authenticator' | 'email_otp'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  tenant: string
  jobTitle: string
}

export interface MfaChallenge {
  method: MfaMethod
  destination: string
  digits: number
  expiresAt: string
  attemptsRemaining: number
}

export interface LoginResponse {
  mfaToken: string
  challenge: MfaChallenge
  devCode: string
}

export interface VerifyMfaResponse {
  accessToken: string
  user: User
}

export interface SessionResponse {
  user: User
}
