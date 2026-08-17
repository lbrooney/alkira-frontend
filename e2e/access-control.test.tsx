import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'

import { renderApp } from '../test/render-app'
import { signIn } from './support'

describe('read/write role (network admin)', () => {
  it('can rename a connector through the edit dialog', async () => {
    const { user } = await renderApp('/login')
    await signIn(user, 'admin@alkira.com')

    await screen.findByRole('heading', { name: 'Network' })
    await user.click(
      await screen.findByRole('button', { name: 'Edit aws-prod-us-west' }),
    )

    const dialog = await screen.findByRole('dialog')
    const nameField = within(dialog).getByLabelText('Connector name')
    await user.clear(nameField)
    await user.type(nameField, 'aws-prod-us-west-2')
    await user.click(
      within(dialog).getByRole('button', { name: 'Save changes' }),
    )

    expect(await screen.findByText('aws-prod-us-west-2')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('aws-prod-us-west')).not.toBeInTheDocument(),
    )
  })

  it('rejects an invalid connector name from the server', async () => {
    const { user } = await renderApp('/login')
    await signIn(user, 'admin@alkira.com')

    await screen.findByRole('heading', { name: 'Network' })
    await user.click(
      await screen.findByRole('button', { name: 'Edit aws-prod-us-west' }),
    )

    const dialog = await screen.findByRole('dialog')
    const nameField = within(dialog).getByLabelText('Connector name')
    await user.clear(nameField)
    await user.type(nameField, 'NOT VALID')
    await user.click(
      within(dialog).getByRole('button', { name: 'Save changes' }),
    )

    expect(
      await within(dialog).findByText(/3–40 lowercase letters/),
    ).toBeInTheDocument()
  })

  it('can disable a connector and see its state change', async () => {
    const { user } = await renderApp('/login')
    await signIn(user, 'admin@alkira.com')

    await screen.findByRole('heading', { name: 'Network' })
    const row = (await screen.findByText('azure-hub-westeurope')).closest('tr')!
    expect(within(row).getByText('ACTIVE')).toBeInTheDocument()

    await user.click(
      within(row).getByRole('button', { name: 'Disable azure-hub-westeurope' }),
    )

    await waitFor(() =>
      expect(within(row).getByText('DOWN')).toBeInTheDocument(),
    )
    expect(
      within(row).getByRole('button', { name: 'Enable azure-hub-westeurope' }),
    ).toBeInTheDocument()
  })

  it('offers connector creation', async () => {
    const { user } = await renderApp('/login')
    await signIn(user, 'admin@alkira.com')

    expect(
      await screen.findByRole('button', { name: 'New connector' }),
    ).toBeInTheDocument()
  })
})

describe('read-only role', () => {
  it('reaches the same protected screen with the data visible', async () => {
    const { user, currentPath } = await renderApp('/login')
    await signIn(user, 'viewer@alkira.com')

    await waitFor(() => expect(currentPath()).toBe('/'))
    expect(
      await screen.findByRole('heading', { name: 'Network' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('aws-prod-us-west')).toBeInTheDocument()
    expect(screen.getByText('Read Only')).toBeInTheDocument()
  })

  it('disables every edit action and explains why', async () => {
    const { user } = await renderApp('/login')
    await signIn(user, 'viewer@alkira.com')

    await screen.findByRole('heading', { name: 'Network' })

    expect(
      await screen.findByRole('button', { name: 'Edit aws-prod-us-west' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Disable aws-prod-us-west' }),
    ).toBeDisabled()
    expect(screen.getAllByRole('tooltip')[0]).toHaveTextContent(
      'Your read-only role cannot modify connectors.',
    )
  })

  it('hides connector creation entirely', async () => {
    const { user } = await renderApp('/login')
    await signIn(user, 'viewer@alkira.com')

    await screen.findByRole('heading', { name: 'Network' })
    expect(
      screen.queryByRole('button', { name: 'New connector' }),
    ).not.toBeInTheDocument()
  })

  it('is refused by the API even when the UI guard is bypassed', async () => {
    const { user } = await renderApp('/login')
    await signIn(user, 'viewer@alkira.com')

    await screen.findByRole('heading', { name: 'Network' })
    await user.click(
      screen.getByRole('button', { name: 'Attempt an edit anyway' }),
    )

    const rejection = await screen.findByRole('alert', undefined, {
      timeout: 5000,
    })
    expect(rejection).toHaveTextContent(
      '403 · Your role does not allow changes to connectors.',
    )

    const row = screen.getByText('aws-prod-us-west').closest('tr')!
    await waitFor(() =>
      expect(within(row).getByText('ACTIVE')).toBeInTheDocument(),
    )
  })

  it('shows its effective permissions on the account screen', async () => {
    const { user } = await renderApp('/login')
    await signIn(user, 'viewer@alkira.com')

    await screen.findByRole('heading', { name: 'Network' })
    await user.click(screen.getByRole('link', { name: 'Access' }))

    await screen.findByRole('heading', { name: 'Access' })
    const readRow = screen.getByText('connector:read').closest('li')!
    const writeRow = screen.getByText('connector:update').closest('li')!

    expect(within(readRow).getByText('Granted')).toBeInTheDocument()
    expect(within(writeRow).getByText('Denied')).toBeInTheDocument()
  })
})
