import { cn } from '#/lib/cn'

import type { ConnectorState } from '#/features/network/types'
import type { ReactNode } from 'react'

export function Badge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        'font-mono text-[11px] font-medium tracking-wider uppercase',
        className,
      )}
    >
      {children}
    </span>
  )
}

const STATE_STYLES: Record<ConnectorState, { box: string; dot: string }> = {
  ACTIVE: {
    box: 'border-mint-400/50 bg-mint-300/20 text-mint-600',
    dot: 'bg-mint-400',
  },
  DEGRADED: {
    box: 'border-amber-500/35 bg-amber-50 text-amber-500',
    dot: 'bg-amber-500',
  },
  DOWN: {
    box: 'border-steel-200 bg-steel-100 text-steel-500',
    dot: 'bg-steel-400',
  },
}

export function StateBadge({ state }: { state: ConnectorState }) {
  const styles = STATE_STYLES[state]
  return (
    <Badge className={styles.box}>
      <span className={cn('size-1.5 rounded-full', styles.dot)} aria-hidden />
      {state}
    </Badge>
  )
}
