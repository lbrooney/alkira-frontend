import type { MfaChallenge, MfaMethod, User } from '#/features/auth/types'
import type { Connector } from '#/features/network/types'

export interface MockUser extends User {
  password: string
  mfaMethod: MfaMethod
}

export const MOCK_PASSWORD = 'Alkira#2024'

export const MAX_PASSWORD_ATTEMPTS = 5
export const MAX_MFA_ATTEMPTS = 5
export const OTP_DIGITS = 6
export const OTP_TTL_MS = 5 * 60 * 1000

const SEED_USERS: readonly MockUser[] = [
  {
    id: 'usr_admin',
    name: 'Ada Okonkwo',
    email: 'admin@alkira.com',
    password: MOCK_PASSWORD,
    role: 'network-admin',
    tenant: 'Northwind Logistics',
    jobTitle: 'Principal Network Architect',
    mfaMethod: 'authenticator',
  },
  {
    id: 'usr_viewer',
    name: 'Sam Rivera',
    email: 'viewer@alkira.com',
    password: MOCK_PASSWORD,
    role: 'read-only',
    tenant: 'Northwind Logistics',
    jobTitle: 'NOC Analyst',
    mfaMethod: 'email_otp',
  },
]

export const DEMO_ACCOUNTS = SEED_USERS.map((user) => ({
  email: user.email,
  password: user.password,
  name: user.name,
  role: user.role,
  mfaMethod: user.mfaMethod,
}))

const SEED_CONNECTORS: readonly Connector[] = [
  {
    id: 'cnx_01',
    name: 'aws-prod-us-west',
    kind: 'AWS-VPC',
    cxp: 'US-WEST-1',
    region: 'us-west-2',
    segment: 'production',
    state: 'ACTIVE',
    enabled: true,
    throughputMbps: 4000,
    updatedAt: '2026-08-04T09:12:00.000Z',
  },
  {
    id: 'cnx_02',
    name: 'azure-hub-westeurope',
    kind: 'AZURE-VNET',
    cxp: 'EU-WEST-1',
    region: 'westeurope',
    segment: 'production',
    state: 'ACTIVE',
    enabled: true,
    throughputMbps: 2000,
    updatedAt: '2026-08-02T14:44:00.000Z',
  },
  {
    id: 'cnx_03',
    name: 'gcp-analytics-euw4',
    kind: 'GCP-VPC',
    cxp: 'EU-WEST-1',
    region: 'europe-west4',
    segment: 'analytics',
    state: 'DEGRADED',
    enabled: true,
    throughputMbps: 1000,
    updatedAt: '2026-08-07T22:03:00.000Z',
  },
  {
    id: 'cnx_04',
    name: 'branch-rotterdam-dc1',
    kind: 'BRANCH',
    cxp: 'EU-WEST-1',
    region: 'nl-rotterdam',
    segment: 'corporate',
    state: 'ACTIVE',
    enabled: true,
    throughputMbps: 500,
    updatedAt: '2026-07-28T11:20:00.000Z',
  },
  {
    id: 'cnx_05',
    name: 'remote-access-emea',
    kind: 'REMOTE-ACCESS',
    cxp: 'EU-WEST-1',
    region: 'eu-central-1',
    segment: 'corporate',
    state: 'DOWN',
    enabled: false,
    throughputMbps: 500,
    updatedAt: '2026-08-09T06:58:00.000Z',
  },
]

export interface PendingChallenge {
  mfaToken: string
  userId: string
  code: string
  expiresAt: number
  attemptsRemaining: number
}

interface Db {
  users: MockUser[]
  connectors: Connector[]
  challenges: Map<string, PendingChallenge>
  sessions: Map<string, string>
  failedLogins: Map<string, number>
}

export const db: Db = createDb()

function createDb(): Db {
  return {
    users: SEED_USERS.map((user) => ({ ...user })),
    connectors: SEED_CONNECTORS.map((connector) => ({ ...connector })),
    challenges: new Map(),
    sessions: new Map(),
    failedLogins: new Map(),
  }
}

export function resetDb() {
  const fresh = createDb()
  db.users = fresh.users
  db.connectors = fresh.connectors
  db.challenges = fresh.challenges
  db.sessions = fresh.sessions
  db.failedLogins = fresh.failedLogins
}

export function findUserByEmail(email: string): MockUser | undefined {
  const normalised = email.trim().toLowerCase()
  return db.users.find((user) => user.email.toLowerCase() === normalised)
}

export function toPublicUser(user: MockUser): User {
  const { password: _password, mfaMethod: _mfaMethod, ...rest } = user
  return rest
}

function randomId(prefix: string) {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${prefix}_${hex}`
}

export function randomOtp(): string {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return String(buffer[0]! % 10 ** OTP_DIGITS).padStart(OTP_DIGITS, '0')
}

export function createChallenge(user: MockUser): PendingChallenge {
  const challenge: PendingChallenge = {
    mfaToken: randomId('mfa'),
    userId: user.id,
    code: randomOtp(),
    expiresAt: Date.now() + OTP_TTL_MS,
    attemptsRemaining: MAX_MFA_ATTEMPTS,
  }
  db.challenges.set(challenge.mfaToken, challenge)
  return challenge
}

export function issueSession(user: MockUser): string {
  const accessToken = randomId('tok')
  db.sessions.set(accessToken, user.id)
  return accessToken
}

export function describeChallenge(
  user: MockUser,
  challenge: PendingChallenge,
): MfaChallenge {
  const [local = '', domain = ''] = user.email.split('@')
  const destination =
    user.mfaMethod === 'email_otp'
      ? `${local.slice(0, 1)}${'•'.repeat(Math.max(local.length - 1, 3))}@${domain}`
      : 'Alkira Authenticator'

  return {
    method: user.mfaMethod,
    destination,
    digits: OTP_DIGITS,
    expiresAt: new Date(challenge.expiresAt).toISOString(),
    attemptsRemaining: challenge.attemptsRemaining,
  }
}
