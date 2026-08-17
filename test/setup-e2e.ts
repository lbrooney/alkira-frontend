import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'

import { resetAuthStore } from '#/features/auth/auth-store'
import { resetDb } from '#/mocks/db'
import { setDemoCode } from '#/mocks/demo-code-store'
import { worker } from '#/mocks/browser'

beforeAll(async () => {
  await worker.start({
    quiet: true,
    onUnhandledRequest: 'bypass',
  })
})

afterEach(() => {
  cleanup()
  worker.resetHandlers()
  resetDb()
  resetAuthStore()
  setDemoCode(null)
  sessionStorage.clear()
})

afterAll(() => worker.stop())
