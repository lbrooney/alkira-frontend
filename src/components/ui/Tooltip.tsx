import { useId } from 'react'

import type { ReactNode } from 'react'

export function Tooltip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  const id = useId()

  return (
    <span className="group relative inline-flex">
      <span aria-describedby={id} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-30 w-max max-w-56
          -translate-x-1/2 rounded-control bg-ink-900 px-2.5 py-1.5 text-center text-xs
          leading-snug font-normal text-white opacity-0 shadow-panel transition-opacity
          duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  )
}
