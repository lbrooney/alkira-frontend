import { cn } from '#/lib/cn'

import type { ReactNode } from 'react'

type Tone = 'danger' | 'info' | 'warning' | 'success'

const TONES: Record<Tone, { box: string; icon: string; path: string }> = {
  danger: {
    box: 'border-danger-200 bg-danger-50 text-danger-700',
    icon: 'fill-danger-500',
    path: 'M8 1.5 15 14H1L8 1.5Zm0 4.25a.75.75 0 0 0-.75.75v2.75a.75.75 0 0 0 1.5 0V6.5A.75.75 0 0 0 8 5.75Zm0 5.25a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z',
  },
  warning: {
    box: 'border-amber-500/30 bg-amber-50 text-ink-800',
    icon: 'fill-amber-500',
    path: 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 .75-.75Zm0 6.1a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9Z',
  },
  info: {
    box: 'border-brand-200 bg-brand-50 text-brand-800',
    icon: 'fill-brand-500',
    path: 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 2.9a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9Zm.75 3.35v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 1.5 0Z',
  },
  success: {
    box: 'border-mint-400/40 bg-mint-300/20 text-mint-600',
    icon: 'fill-mint-600',
    path: 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm3.28 4.72a.75.75 0 0 1 0 1.06l-3.9 3.9a.75.75 0 0 1-1.06 0L4.72 9.08a.75.75 0 1 1 1.06-1.06l1.07 1.07 3.37-3.37a.75.75 0 0 1 1.06 0Z',
  },
}

export interface CalloutProps {
  tone?: Tone
  title?: string
  children: ReactNode
  className?: string
  role?: 'alert' | 'status'
  action?: ReactNode
}

export function Callout({
  tone = 'info',
  title,
  children,
  className,
  role = 'status',
  action,
}: CalloutProps) {
  const styles = TONES[tone]

  return (
    <div
      role={role}
      className={cn(
        'flex items-start gap-3 rounded-control border px-3.5 py-3 text-[13px] leading-relaxed',
        styles.box,
        className,
      )}
    >
      <svg
        viewBox="0 0 16 16"
        className={cn('mt-0.5 size-4 shrink-0', styles.icon)}
        aria-hidden="true"
      >
        <path d={styles.path} />
      </svg>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? 'mt-0.5' : undefined}>{children}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
