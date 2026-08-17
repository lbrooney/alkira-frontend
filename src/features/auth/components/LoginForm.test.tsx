import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'

import { renderApp } from '../../../../test/render-app'
import { MOCK_PASSWORD } from '#/mocks/db'

describe('sign-in form', () => {
  it('reports both fields as required and does not navigate', async () => {
    const { user, currentPath } = await renderApp('/login')

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(currentPath()).toBe('/login')
  })

  it('rejects a malformed email before contacting the API', async () => {
    const { user } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), MOCK_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText(/Enter a valid email address/),
    ).toBeInTheDocument()
  })

  it('flags a short password', async () => {
    const { user } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'admin@alkira.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText('Password must be at least 8 characters.'),
    ).toBeInTheDocument()
  })

  it('validates a field once it has been blurred', async () => {
    const { user } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'bad')
    await user.tab()

    expect(
      await screen.findByText(/Enter a valid email address/),
    ).toBeInTheDocument()
  })

  it('surfaces the API error for wrong credentials without leaking which field was wrong', async () => {
    const { user, currentPath } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'admin@alkira.com')
    await user.type(screen.getByLabelText('Password'), 'WrongPassword1')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'That email and password combination is not recognised.',
    )
    expect(currentPath()).toBe('/login')
  })

  it('gives the same message for an account that does not exist', async () => {
    const { user } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'nobody@alkira.com')
    await user.type(screen.getByLabelText('Password'), MOCK_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That email and password combination is not recognised.',
    )
  })

  it('advances to the MFA step on valid credentials', async () => {
    const { user, currentPath } = await renderApp('/login')

    await user.click(screen.getAllByRole('button', { name: 'Use' })[0]!)
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(currentPath()).toBe('/mfa'))
    expect(
      await screen.findByRole('heading', { name: 'Two-factor verification' }),
    ).toBeInTheDocument()
  })

  it('locks the account after five failed attempts', async () => {
    const { user } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'admin@alkira.com')
    await user.type(screen.getByLabelText('Password'), 'WrongPassword1')

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await user.click(screen.getByRole('button', { name: 'Continue' }))
      await screen.findByRole('alert')
    }

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /This account is locked/,
      ),
    )
  })
})
