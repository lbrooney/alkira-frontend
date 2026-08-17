import { expect } from 'vitest'
import { screen } from '@testing-library/react'

import { MOCK_PASSWORD } from '#/mocks/db'

import type { UserEvent } from '@testing-library/user-event'

export async function signIn(
  user: UserEvent,
  email: string,
  password: string = MOCK_PASSWORD,
) {
  await user.type(await screen.findByLabelText('Work email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Continue' }))

  await screen.findByRole('heading', { name: 'Two-factor verification' })

  const code = (await screen.findByTestId('demo-otp')).textContent.trim()
  expect(code).toMatch(/^\d{6}$/)

  await user.type(screen.getByLabelText('Verification code'), code)

  await screen.findByRole('button', { name: 'Sign out' }, { timeout: 5000 })

  return code
}
