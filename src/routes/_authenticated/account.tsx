import { createFileRoute } from '@tanstack/react-router'

import { Badge } from '#/components/ui/Badge'
import { useCurrentUser } from '#/features/auth/auth-store'
import {
  PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  can,
} from '#/features/auth/permissions'

export const Route = createFileRoute('/_authenticated/account')({
  component: AccountPage,
})

function AccountPage() {
  const user = useCurrentUser()

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <p className="font-mono text-[10px] tracking-[0.18em] text-steel-500 uppercase">
          Account
        </p>
        <h1 className="mt-1.5 text-[1.75rem] font-medium tracking-[-0.025em] text-ink-900">
          Access
        </h1>
      </header>

      <section className="rounded-lg border border-steel-200 bg-white p-6 shadow-card">
        <dl className="grid gap-5 sm:grid-cols-2">
          {[
            ['Name', user.name],
            ['Email', user.email],
            ['Tenant', user.tenant],
            ['Job title', user.jobTitle],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-mono text-[10px] tracking-[0.14em] text-steel-500 uppercase">
                {label}
              </dt>
              <dd className="mt-1 text-[15px] text-ink-900">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-steel-100 pt-5">
          <div className="flex items-center gap-3">
            <Badge className="border-brand-200 bg-brand-50 text-brand-700">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-steel-500">
            {ROLE_DESCRIPTIONS[user.role]}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-steel-200 bg-white shadow-card">
        <h2 className="border-b border-steel-200 bg-steel-50 px-5 py-3 font-mono text-[10px] tracking-[0.14em] text-steel-500 uppercase">
          Effective permissions
        </h2>
        <ul>
          {PERMISSIONS.map((permission) => {
            const granted = can(user, permission)
            return (
              <li
                key={permission}
                className="flex items-center justify-between gap-4 border-b border-steel-100
                  px-5 py-3 text-sm last:border-0"
              >
                <span className="font-mono text-[13px] text-ink-800">
                  {permission}
                </span>
                <span
                  className={
                    granted
                      ? 'font-mono text-[11px] tracking-wider text-mint-600 uppercase'
                      : 'font-mono text-[11px] tracking-wider text-steel-400 uppercase'
                  }
                >
                  {granted ? 'Granted' : 'Denied'}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
