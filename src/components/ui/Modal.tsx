import { useEffect, useRef } from 'react'

import type { ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-lg border border-steel-200 bg-white
        p-0 text-ink-900 shadow-panel backdrop:bg-ink-900/45 backdrop:backdrop-blur-[2px]"
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 cursor-default"
      />
      <div className="relative flex flex-col">
        <header className="border-b border-steel-100 px-6 pt-5 pb-4">
          <h2 className="text-lg font-medium tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-[13px] text-steel-500">{description}</p>
          ) : null}
        </header>
        {children}
      </div>
    </dialog>
  )
}
