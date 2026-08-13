import { cn } from '#/lib/cn'

export function BrandMark({
  className,
  tone = 'ink',
}: {
  className?: string
  tone?: 'ink' | 'light'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.03em]',
        tone === 'light' ? 'text-white' : 'text-ink-900',
        className,
      )}
    >
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden="true">
        <path
          d="M6 21 14 6l8 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="6" r="3" className="fill-brand-500" />
        <circle cx="6" cy="21" r="2.6" className="fill-mint-400" />
        <circle cx="22" cy="21" r="2.6" className="fill-lime-300" />
      </svg>
      alkira
    </span>
  )
}
