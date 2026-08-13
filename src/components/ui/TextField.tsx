import { useId } from 'react'

import { cn } from '#/lib/cn'

import type { InputHTMLAttributes, ReactNode } from 'react'

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id'
> {
  label: string
  error?: string
  hint?: ReactNode
  adornment?: ReactNode
}

export function TextField({
  label,
  error,
  hint,
  adornment,
  className,
  ...props
}: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[13px] font-medium tracking-wide text-ink-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-control border bg-white px-3 text-[15px] text-ink-900',
            'placeholder:text-steel-400 transition-colors duration-150',
            'focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/15'
              : 'border-steel-200 hover:border-steel-300',
            adornment ? 'pr-20' : null,
            className,
          )}
          {...props}
        />
        {adornment ? (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {adornment}
          </div>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="text-xs text-steel-500">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-[13px] font-medium text-danger-700"
        >
          <svg
            viewBox="0 0 16 16"
            className="mt-0.5 size-3.5 shrink-0 fill-danger-500"
            aria-hidden="true"
          >
            <path d="M8 1.5 15 14H1L8 1.5Zm0 4.25a.75.75 0 0 0-.75.75v2.75a.75.75 0 0 0 1.5 0V6.5A.75.75 0 0 0 8 5.75Zm0 5.25a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  )
}
