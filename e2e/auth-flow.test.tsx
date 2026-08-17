import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'

import { renderApp } from '../test/render-app'
import { signIn } from './support'

describe('login and MFA', () => {
  it('takes a network admin from sign-in to the protected screen', async () => {
    const { user, currentPath } = await renderApp('/login')

    expect(currentPath()).toBe('/login')
    await signIn(user, 'admin@alkira.com')

    await waitFor(() => expect(currentPath()).toBe('/'))
    expect(
      await screen.findByRole('heading', { name: 'Network' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('aws-prod-us-west')).toBeInTheDocument()
    expect(screen.getByText('Network Admin')).toBeInTheDocument()
  })

  it('will not let the MFA step be skipped', async () => {
    const { user, router, currentPath } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'admin@alkira.com')
    await user.type(screen.getByLabelText('Password'), 'Alkira#2024')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await screen.findByRole('heading', { name: 'Two-factor verification' })

    await router.navigate({ to: '/' })

    await waitFor(() => expect(currentPath()).toBe('/mfa'))
    expect(
      screen.queryByRole('heading', { name: 'Network' }),
    ).not.toBeInTheDocument()
  })

  it('can abandon the MFA challenge and start over', async () => {
    const { user, currentPath } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'admin@alkira.com')
    await user.type(screen.getByLabelText('Password'), 'Alkira#2024')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await screen.findByRole('heading', { name: 'Two-factor verification' })
    await user.click(screen.getByRole('button', { name: /different account/i }))

    await waitFor(() => expect(currentPath()).toBe('/login'))
    expect(await screen.findByLabelText('Work email')).toBeInTheDocument()
  })

  it('rejects a wrong code, counts down the attempts, then accepts the right one', async () => {
    const { user, currentPath } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'viewer@alkira.com')
    await user.type(screen.getByLabelText('Password'), 'Alkira#2024')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await screen.findByRole('heading', { name: 'Two-factor verification' })
    const code = (await screen.findByTestId('demo-otp')).textContent.trim()
    const wrongCode = code === '000000' ? '111111' : '000000'

    await user.type(screen.getByLabelText('Verification code'), wrongCode)

    expect(
      await screen.findByText(/That code is not correct/),
    ).toHaveTextContent('4 attempts remaining')
    expect(currentPath()).toBe('/mfa')

    await user.type(screen.getByLabelText('Verification code'), code)
    await waitFor(() => expect(currentPath()).toBe('/'))
  })

  it('sends the user back to sign-in after too many wrong codes', async () => {
    const { user, currentPath } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'viewer@alkira.com')
    await user.type(screen.getByLabelText('Password'), 'Alkira#2024')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await screen.findByRole('heading', { name: 'Two-factor verification' })
    const code = (await screen.findByTestId('demo-otp')).textContent.trim()

    const guesses = ['111111', '222222', '333333', '444444', '555555', '666666']
      .filter((guess) => guess !== code)
      .slice(0, 5)

    for (const [index, guess] of guesses.slice(0, 4).entries()) {
      await user.type(screen.getByLabelText('Verification code'), guess)

      const remaining = 4 - index
      expect(
        await screen.findByText(/That code is not correct/),
      ).toHaveTextContent(
        `${remaining} attempt${remaining === 1 ? '' : 's'} remaining`,
      )
      await waitFor(() =>
        expect(screen.getByLabelText('Verification code')).toHaveValue(''),
      )
    }

    await user.type(screen.getByLabelText('Verification code'), guesses[4]!)

    await waitFor(() => expect(currentPath()).toBe('/login'), { timeout: 6000 })
    expect(await screen.findByLabelText('Work email')).toBeInTheDocument()
  })

  it('issues a fresh code on resend', async () => {
    const { user } = await renderApp('/login')

    await user.type(screen.getByLabelText('Work email'), 'admin@alkira.com')
    await user.type(screen.getByLabelText('Password'), 'Alkira#2024')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    const first = (await screen.findByTestId('demo-otp')).textContent.trim()

    await user.click(screen.getByRole('button', { name: 'Resend code' }))
    await screen.findByText('A new code is on its way.')

    await waitFor(() =>
      expect(screen.getByTestId('demo-otp').textContent.trim()).not.toBe(first),
    )
  })

  it('returns the user to where they were headed after signing in', async () => {
    const { user, currentPath } = await renderApp('/account')

    await waitFor(() => expect(currentPath()).toBe('/login'))

    await signIn(user, 'admin@alkira.com')

    await waitFor(() => expect(currentPath()).toBe('/account'))
    expect(
      await screen.findByRole('heading', { name: 'Access' }),
    ).toBeInTheDocument()
  })

  it('protects the app again after signing out', async () => {
    const { user, currentPath } = await renderApp('/login')

    await signIn(user, 'admin@alkira.com')
    await waitFor(() => expect(currentPath()).toBe('/'))

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => expect(currentPath()).toBe('/login'))
    expect(await screen.findByLabelText('Work email')).toBeInTheDocument()
  })
})

describe('sign up', () => {
  it('is reachable from sign-in and validates before submitting', async () => {
    const { user, currentPath } = await renderApp('/login')

    await user.click(screen.getByRole('link', { name: 'Request access' }))
    await waitFor(() => expect(currentPath()).toBe('/signup'))

    await user.click(
      await screen.findByRole('button', { name: 'Request access' }),
    )

    expect(
      await screen.findByText('Full name is required.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Company is required.')).toBeInTheDocument()
    expect(screen.getByText('Work email is required.')).toBeInTheDocument()
  })

  it('reports a mismatched password confirmation', async () => {
    const { user } = await renderApp('/signup')

    await user.type(await screen.findByLabelText('Full name'), 'Ada Okonkwo')
    await user.type(screen.getByLabelText('Company'), 'Northwind')
    await user.type(screen.getByLabelText('Work email'), 'ada@northwind.com')
    await user.type(screen.getByLabelText('Password'), 'Alkira2024')
    await user.type(screen.getByLabelText('Confirm password'), 'Alkira2025')
    await user.click(screen.getByRole('button', { name: 'Request access' }))

    expect(
      await screen.findByText('Passwords do not match.'),
    ).toBeInTheDocument()
  })

  it('refuses an email that already has an account', async () => {
    const { user } = await renderApp('/signup')

    await user.type(await screen.findByLabelText('Full name'), 'Ada Okonkwo')
    await user.type(screen.getByLabelText('Company'), 'Northwind')
    await user.type(screen.getByLabelText('Work email'), 'admin@alkira.com')
    await user.type(screen.getByLabelText('Password'), 'Alkira2024')
    await user.type(screen.getByLabelText('Confirm password'), 'Alkira2024')
    await user.click(screen.getByRole('button', { name: 'Request access' }))

    expect(
      await screen.findByText(
        'An account already exists for that email address.',
      ),
    ).toBeInTheDocument()
  })

  it('confirms a valid request and offers a way back', async () => {
    const { user } = await renderApp('/signup')

    await user.type(await screen.findByLabelText('Full name'), 'Ada Okonkwo')
    await user.type(screen.getByLabelText('Company'), 'Northwind')
    await user.type(screen.getByLabelText('Work email'), 'ada@northwind.com')
    await user.type(screen.getByLabelText('Password'), 'Alkira2024')
    await user.type(screen.getByLabelText('Confirm password'), 'Alkira2024')
    await user.click(screen.getByRole('button', { name: 'Request access' }))

    const confirmation = await screen.findByText(/Request received/)
    expect(
      within(confirmation.closest('div')!.parentElement!).getByText(
        'ada@northwind.com',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to sign in' }),
    ).toBeInTheDocument()
  })
})
