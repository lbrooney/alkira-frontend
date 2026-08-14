import { ROLE_LABELS } from '#/features/auth/permissions'
import { DEMO_ACCOUNTS } from './db'

export function DemoAccounts({
  onUse,
}: {
  onUse: (credentials: { email: string; password: string }) => void
}) {
  return (
    <section
      aria-labelledby="demo-accounts-heading"
      className="rounded-control border border-dashed border-steel-300 bg-steel-50 p-4"
    >
      <h2
        id="demo-accounts-heading"
        className="font-mono text-[10px] tracking-[0.18em] text-steel-500 uppercase"
      >
        Demo accounts · mock API
      </h2>

      <ul className="mt-3 flex flex-col gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <li
            key={account.email}
            className="flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-[13px] text-ink-800">
                {account.email}
              </p>
              <p className="text-xs text-steel-500">
                {ROLE_LABELS[account.role]} ·{' '}
                {account.mfaMethod === 'email_otp'
                  ? 'email code'
                  : 'authenticator'}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onUse({ email: account.email, password: account.password })
              }
              className="shrink-0 rounded-control border border-steel-200 bg-white px-2.5 py-1
                text-xs font-medium text-brand-500 transition-colors hover:border-brand-500
                hover:bg-brand-50"
            >
              Use
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-steel-500">
        Every account uses the password{' '}
        <code className="font-mono text-ink-800">
          {DEMO_ACCOUNTS[0]?.password}
        </code>
        . The one-time code is shown on the next step.
      </p>
    </section>
  )
}
