import { useId } from 'react'

import { cn } from '#/lib/cn'

export function OtpInput({
  value,
  onChange,
  digits,
  label,
  error,
  disabled,
  autoFocus,
}: {
  value: string
  onChange: (value: string) => void
  digits: number
  label: string
  error?: string
  disabled?: boolean
  autoFocus?: boolean
}) {
  const id = useId()
  const errorId = `${id}-error`
  const cells = Array.from({ length: digits }, (_, index) => index)
  const activeIndex = Math.min(value.length, digits - 1)

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-ink-700">
        {label}
      </label>

      <div className="group relative">
        <input
          id={id}
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={digits}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) =>
            onChange(event.target.value.replace(/\D/g, '').slice(0, digits))
          }
          className="absolute inset-0 z-10 h-full w-full cursor-text text-transparent
            caret-transparent opacity-0 focus:outline-none"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none grid gap-2"
          style={{ gridTemplateColumns: `repeat(${digits}, minmax(0, 1fr))` }}
        >
          {cells.map((index) => {
            const char = value[index]
            const isActive = !disabled && index === activeIndex
            return (
              <div
                key={index}
                className={cn(
                  'flex h-14 items-center justify-center rounded-control border bg-white',
                  'font-mono text-xl font-medium text-ink-900 transition-colors duration-150',
                  error ? 'border-danger-500' : 'border-steel-200',
                  isActive &&
                    'group-has-[input:focus]:border-brand-500 group-has-[input:focus]:ring-3 group-has-[input:focus]:ring-brand-500/15',
                  disabled && 'bg-steel-50 text-steel-400',
                )}
              >
                {char ?? (
                  <span className="text-steel-300">
                    {isActive ? (
                      <span className="block h-6 w-px animate-pulse bg-brand-500 opacity-0 group-has-[input:focus]:opacity-100" />
                    ) : (
                      '·'
                    )}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-[13px] font-medium text-danger-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
