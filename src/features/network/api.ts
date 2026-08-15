import { queryOptions } from '@tanstack/react-query'

import { apiFetch } from '#/lib/api-client'

import type { Connector, ConnectorPatch } from './types'

export const connectorKeys = {
  all: ['connectors'] as const,
  list: () => [...connectorKeys.all, 'list'] as const,
}

export const connectorsQueryOptions = () =>
  queryOptions({
    queryKey: connectorKeys.list(),
    queryFn: async () => {
      const { connectors } = await apiFetch<{ connectors: Connector[] }>(
        '/api/network/connectors',
      )
      return connectors
    },
    staleTime: 30 * 1000,
  })

export function updateConnector(input: { id: string; patch: ConnectorPatch }) {
  return apiFetch<Connector>(`/api/network/connectors/${input.id}`, {
    method: 'PATCH',
    json: input.patch,
  })
}
