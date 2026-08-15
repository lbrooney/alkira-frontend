import { StateBadge } from '#/components/ui/Badge'
import { Button } from '#/components/ui/Button'
import { Tooltip } from '#/components/ui/Tooltip'
import { cn } from '#/lib/cn'

import type { Connector } from '../types'

const NO_WRITE_ACCESS =
  'Your read-only role cannot modify connectors. Ask a Network Admin for access.'

export function ConnectorTable({
  connectors,
  canEdit,
  pendingId,
  onEdit,
  onToggle,
}: {
  connectors: Connector[]
  canEdit: boolean
  pendingId: string | null
  onEdit: (connector: Connector) => void
  onToggle: (connector: Connector) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-steel-200 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Connectors in this tenant, with their cloud exchange point, segment
            and health.
          </caption>
          <thead>
            <tr className="border-b border-steel-200 bg-steel-50">
              {[
                'Connector',
                'Type',
                'CXP / Region',
                'Segment',
                'State',
                'Capacity',
                '',
              ].map((heading, index) => (
                <th
                  key={heading || 'actions'}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-mono text-[10px] font-medium tracking-[0.14em] text-steel-500 uppercase',
                    index === 6 && 'text-right',
                  )}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {connectors.map((connector) => {
              const busy = pendingId === connector.id
              return (
                <tr
                  key={connector.id}
                  className={cn(
                    'border-b border-steel-100 last:border-0 transition-opacity',
                    busy && 'opacity-60',
                    !connector.enabled && 'bg-steel-50/60',
                  )}
                >
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    <span className="font-mono text-[13px] font-medium text-ink-900">
                      {connector.name}
                    </span>
                    {!connector.enabled ? (
                      <span className="mt-0.5 block text-xs text-steel-400">
                        Disabled
                      </span>
                    ) : null}
                  </th>

                  <td className="px-4 py-3 font-mono text-xs text-steel-500">
                    {connector.kind}
                  </td>

                  <td className="px-4 py-3 text-[13px] text-ink-700">
                    <span className="font-mono">{connector.cxp}</span>
                    <span className="mt-0.5 block text-xs text-steel-400">
                      {connector.region}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-[13px] text-ink-700">
                    {connector.segment}
                  </td>

                  <td className="px-4 py-3">
                    <StateBadge state={connector.state} />
                  </td>

                  <td className="px-4 py-3 font-mono text-[13px] text-ink-700">
                    {connector.throughputMbps.toLocaleString()}
                    <span className="text-steel-400"> Mbps</span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <RowAction
                        canEdit={canEdit}
                        label={connector.enabled ? 'Disable' : 'Enable'}
                        connectorName={connector.name}
                        busy={busy}
                        onClick={() => onToggle(connector)}
                      />
                      <RowAction
                        canEdit={canEdit}
                        label="Edit"
                        connectorName={connector.name}
                        busy={busy}
                        onClick={() => onEdit(connector)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RowAction({
  canEdit,
  label,
  connectorName,
  busy,
  onClick,
}: {
  canEdit: boolean
  label: string
  connectorName: string
  busy: boolean
  onClick: () => void
}) {
  const button = (
    <Button
      variant="secondary"
      size="sm"
      disabled={!canEdit || busy}
      onClick={onClick}
      aria-label={`${label} ${connectorName}`}
    >
      {label}
    </Button>
  )

  return canEdit ? button : <Tooltip label={NO_WRITE_ACCESS}>{button}</Tooltip>
}
