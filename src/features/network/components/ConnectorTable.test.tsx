import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConnectorTable } from './ConnectorTable'

import type { Connector } from '../types'

const connectors: Connector[] = [
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

function renderTable(canEdit: boolean, pendingId: string | null = null) {
  const onEdit = vi.fn()
  const onToggle = vi.fn()
  render(
    <ConnectorTable
      connectors={connectors}
      canEdit={canEdit}
      pendingId={pendingId}
      onEdit={onEdit}
      onToggle={onToggle}
    />,
  )
  return { onEdit, onToggle, user: userEvent.setup() }
}

describe('ConnectorTable access control', () => {
  it('enables the edit actions for a read/write role', async () => {
    const { onEdit, onToggle, user } = renderTable(true)

    const edit = screen.getByRole('button', { name: 'Edit aws-prod-us-west' })
    expect(edit).toBeEnabled()

    await user.click(edit)
    expect(onEdit).toHaveBeenCalledWith(connectors[0])

    await user.click(
      screen.getByRole('button', { name: 'Disable aws-prod-us-west' }),
    )
    expect(onToggle).toHaveBeenCalledWith(connectors[0])
  })

  it('disables every edit action for a read-only role', () => {
    renderTable(false)

    expect(
      screen.getByRole('button', { name: 'Edit aws-prod-us-west' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Disable aws-prod-us-west' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Enable remote-access-emea' }),
    ).toBeDisabled()
  })

  it('explains why the actions are unavailable', () => {
    renderTable(false)

    const tooltips = screen.getAllByRole('tooltip')
    expect(tooltips.length).toBeGreaterThan(0)
    expect(tooltips[0]).toHaveTextContent(
      'Your read-only role cannot modify connectors.',
    )
  })

  it('offers no explanation when the actions work', () => {
    renderTable(true)
    expect(screen.queryAllByRole('tooltip')).toHaveLength(0)
  })

  it('labels the toggle by what it will do', () => {
    renderTable(true)

    expect(
      screen.getByRole('button', { name: 'Disable aws-prod-us-west' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Enable remote-access-emea' }),
    ).toBeInTheDocument()
  })

  it('blocks interaction on the row currently being written', () => {
    renderTable(true, 'cnx_01')

    expect(
      screen.getByRole('button', { name: 'Edit aws-prod-us-west' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Enable remote-access-emea' }),
    ).toBeEnabled()
  })
})
