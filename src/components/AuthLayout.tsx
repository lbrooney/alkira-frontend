import { Link } from '@tanstack/react-router'

import { BrandMark } from './BrandMark'
import { NetworkTopology } from './NetworkTopology'

import type { ReactNode } from 'react'

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  subtitle: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(30rem,42%)]">
      <aside className="relative hidden overflow-hidden bg-ink-900 text-white lg:flex lg:flex-col">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(120% 90% at 15% 0%, rgb(43 86 240 / 0.42) 0%, transparent 58%), radial-gradient(80% 70% at 92% 92%, rgb(87 229 178 / 0.16) 0%, transparent 60%)',
          }}
          aria-hidden
        />

        <div className="relative flex flex-1 flex-col justify-between p-12 xl:p-16">
          <Link to="/login" className="w-fit rounded-control">
            <BrandMark tone="light" />
          </Link>

          <div className="max-w-lg">
            <NetworkTopology className="mb-12 h-56 w-full text-mint-400" />
            <p className="font-mono text-[11px] tracking-[0.22em] text-mint-400 uppercase">
              Cloud Services Exchange
            </p>
            <h2 className="mt-4 text-[2.75rem] leading-[1.06] font-light tracking-[-0.02em] text-white">
              One network fabric across{' '}
              <span className="text-lime-300">every cloud.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-steel-300">
              Build, deploy and govern global connectivity from a single portal.
              No hardware, no per-cloud plumbing.
            </p>
          </div>

          <dl className="grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              ['CXPs', '30+'],
              ['Clouds', '5'],
              ['Deploy time', 'Minutes'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[10px] tracking-[0.18em] text-steel-300 uppercase">
                  {label}
                </dt>
                <dd className="mt-1.5 text-2xl font-light text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>

      <main className="flex flex-col bg-white">
        <div className="flex items-center justify-between border-b border-steel-100 px-6 py-4 lg:hidden">
          <BrandMark />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-[26rem] animate-rise">
            <p className="font-mono text-[11px] tracking-[0.2em] text-brand-500 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-[2rem] leading-tight font-medium tracking-[-0.025em] text-ink-900">
              {title}
            </h1>
            <div className="mt-2.5 text-[15px] leading-relaxed text-steel-500">
              {subtitle}
            </div>

            <div className="mt-8">{children}</div>

            {footer ? (
              <div className="mt-8 border-t border-steel-100 pt-6 text-sm text-steel-500">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
