import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { Button } from '#/components/ui/Button'
import { Callout } from '#/components/ui/Callout'
import { useCurrentUser } from '#/features/auth/auth-store'
import { usePermission } from '#/features/auth/use-permission'
import {
  connectorKeys,
  connectorsQueryOptions,
  updateConnector,
} from '#/features/network/api'
import { ConnectorTable } from '#/features/network/components/ConnectorTable'
import { EditConnectorDialog } from '#/features/network/components/EditConnectorDialog'
import { ApiError } from '#/lib/api-client'

import type { Connector } from '#/features/network/types'

export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(connectorsQueryOptions()),
  component: NetworkPage,
})

function NetworkPage() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  const canUpdate = usePermission('connector:update')
  const canCreate = usePermission('connector:create')

  const [editing, setEditing] = useState<Connector | null>(null)

  const connectorsQuery = useQuery(connectorsQueryOptions())

  const mutation = useMutation({
    mutationFn: updateConnector,
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: connectorKeys.list() })
      const previous = queryClient.getQueryData<Connector[]>(
        connectorKeys.list(),
      )

      queryClient.setQueryData<Connector[]>(connectorKeys.list(), (current) =>
        current?.map((connector) =>
          connector.id === id
            ? {
                ...connector,
                ...patch,
                state:
                  patch.enabled === undefined
                    ? connector.state
                    : patch.enabled
                      ? 'ACTIVE'
                      : 'DOWN',
              }
            : connector,
        ),
      )

      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(connectorKeys.list(), context.previous)
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: connectorKeys.list() }),
  })

  const connectors = connectorsQuery.data ?? []
  const pendingId = mutation.isPending ? mutation.variables.id : null

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-steel-500 uppercase">
            Cloud Services Exchange
          </p>
          <h1 className="mt-1.5 text-[1.75rem] font-medium tracking-[-0.025em] text-ink-900">
            Network
          </h1>
          <p className="mt-1 text-sm text-steel-500">
            Signed in as {user.name} · {user.jobTitle}
          </p>
        </div>

        {canCreate ? (
          <Button
            icon={
              <svg
                viewBox="0 0 16 16"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M8 3v10M3 8h10" />
              </svg>
            }
            onClick={() =>
              window.alert(
                'Connector provisioning is out of scope for this exercise.',
              )
            }
          >
            New connector
          </Button>
        ) : null}
      </header>

      <StatRow connectors={connectors} />

      {!canUpdate ? (
        <Callout
          tone="warning"
          title="Read-only access"
          action={
            <Button
              variant="secondary"
              size="sm"
              loading={mutation.isPending}
              onClick={() => {
                const first = connectors[0]
                if (first) {
                  mutation.mutate({
                    id: first.id,
                    patch: { enabled: !first.enabled },
                  })
                }
              }}
            >
              Attempt an edit anyway
            </Button>
          }
        >
          Edit actions are disabled for your role. The mock API enforces the
          same rule. Use the button to watch the request come back{' '}
          <span className="font-mono">403</span>.
        </Callout>
      ) : null}

      {mutation.isError ? (
        <Callout tone="danger" role="alert" title="Change rejected">
          {mutation.error instanceof ApiError
            ? `${mutation.error.status} · ${mutation.error.message}`
            : 'Something went wrong while saving. Please try again.'}
        </Callout>
      ) : null}

      {connectorsQuery.isError ? (
        <Callout
          tone="danger"
          role="alert"
          title="Could not load connectors"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void connectorsQuery.refetch()}
            >
              Retry
            </Button>
          }
        >
          The network inventory service did not respond.
        </Callout>
      ) : (
        <ConnectorTable
          connectors={connectors}
          canEdit={canUpdate}
          pendingId={pendingId}
          onEdit={setEditing}
          onToggle={(connector) =>
            mutation.mutate({
              id: connector.id,
              patch: { enabled: !connector.enabled },
            })
          }
        />
      )}

      <EditConnectorDialog
        key={editing?.id ?? 'none'}
        connector={editing}
        saving={mutation.isPending}
        onClose={() => setEditing(null)}
        onSave={async (patch) => {
          if (editing) await mutation.mutateAsync({ id: editing.id, patch })
        }}
      />
    </div>
  )
}

function StatRow({ connectors }: { connectors: Connector[] }) {
  const stats = [
    { label: 'Connectors', value: String(connectors.length) },
    {
      label: 'Active',
      value: String(connectors.filter((c) => c.state === 'ACTIVE').length),
    },
    {
      label: 'Needs attention',
      value: String(connectors.filter((c) => c.state !== 'ACTIVE').length),
    },
    {
      label: 'Provisioned capacity',
      value: `${connectors
        .reduce((total, c) => total + c.throughputMbps, 0)
        .toLocaleString()} Mbps`,
    },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-steel-200 bg-white px-4 py-3.5 shadow-card"
        >
          <dt className="font-mono text-[10px] tracking-[0.14em] text-steel-500 uppercase">
            {stat.label}
          </dt>
          <dd className="mt-1.5 text-2xl font-light tracking-tight text-ink-900">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
