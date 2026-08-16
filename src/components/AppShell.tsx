import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { logout } from '#/features/auth/api'
import { authActions, useSessionUser } from '#/features/auth/auth-store'
import { ROLE_LABELS, isReadOnly } from '#/features/auth/permissions'
import { cn } from '#/lib/cn'
import { BrandMark } from './BrandMark'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

import type { ReactNode } from 'react'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Network',
    icon: 'M3 12h4l2.5-6 4 12L16 12h5',
  },
  {
    to: '/account',
    label: 'Access',
    icon: 'M12 3 4 6.5v5c0 4.5 3.3 8.4 8 9.5 4.7-1.1 8-5 8-9.5v-5L12 3Z',
  },
] as const

export function AppShell({ children }: { children: ReactNode }) {
  const user = useSessionUser()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: async () => {
      authActions.signOut()
      queryClient.clear()
      await navigate({ to: '/login' })
    },
  })

  if (!user) return null

  const readOnly = isReadOnly(user)
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="min-h-screen bg-steel-50">
      <header className="sticky top-0 z-20 border-b border-steel-200 bg-white">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="rounded-control">
            <BrandMark />
          </Link>

          <span className="hidden h-6 w-px bg-steel-200 sm:block" />
          <span className="hidden truncate text-sm text-steel-500 sm:block">
            {user.tenant}
          </span>

          <div className="ml-auto flex items-center gap-3">
            <Badge
              className={cn(
                readOnly
                  ? 'border-steel-200 bg-steel-100 text-steel-500'
                  : 'border-brand-200 bg-brand-50 text-brand-700',
              )}
            >
              {ROLE_LABELS[user.role]}
            </Badge>

            <div className="hidden items-center gap-2.5 sm:flex">
              <span
                aria-hidden
                className="flex size-8 items-center justify-center rounded-full bg-ink-900
                  font-mono text-xs font-medium text-white"
              >
                {initials}
              </span>
              <span className="text-sm font-medium text-ink-800">
                {user.name}
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              loading={logoutMutation.isPending}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[90rem] gap-0 px-0 sm:px-6">
        <nav
          aria-label="Sections"
          className="sticky top-16 hidden h-[calc(100vh-4rem)] w-52 shrink-0 flex-col gap-1 py-6 pr-6 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === '/' }}
              className="flex items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium
                text-steel-500 transition-colors hover:bg-white hover:text-ink-900"
              activeProps={{
                className: 'bg-white text-ink-900 shadow-card',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-0 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
