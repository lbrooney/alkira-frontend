import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'

import { resetAuthStore } from '#/features/auth/auth-store'
import { resetDb } from '#/mocks/db'
import { setDemoCode } from '#/mocks/demo-code-store'
import { server } from '#/mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  window.scrollTo = () => {}
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
  resetAuthStore()
  setDemoCode(null)
})

afterAll(() => server.close())
