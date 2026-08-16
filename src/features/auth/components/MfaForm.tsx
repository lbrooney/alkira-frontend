import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '#/components/ui/Button'
import { Callout } from '#/components/ui/Callout'
import { OtpInput } from '#/components/ui/OtpInput'
import { ApiError } from '#/lib/api-client'
import { setDemoCode, useDemoCode } from '#/mocks/demo-code-store'
import { authKeys, resendMfa, verifyMfa } from '../api'
import { authActions } from '../auth-store'
import { validateOtp } from '../validation'

import type { MfaChallenge } from '../types'

function useCountdown(expiresAt: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.round((Date.parse(expiresAt) - Date.now()) / 1000)),
  )

  useEffect(() => {
    const tick = () =>
      setRemaining(
        Math.max(0, Math.round((Date.parse(expiresAt) - Date.now()) / 1000)),
      )
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  return remaining
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

export function MfaForm({
  email,
  mfaToken,
  challenge,
  redirect,
}: {
  email: string
  mfaToken: string
  challenge: MfaChallenge
  redirect?: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const demoCode = useDemoCode()

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  const remaining = useCountdown(challenge.expiresAt)
  const expired = remaining <= 0

  const lastAttempt = useRef<string | null>(null)
  const inFlight = useRef(false)

  const submit = async (candidate: string) => {
    const validation = validateOtp(candidate, challenge.digits)
    if (validation.code) {
      setFieldError(validation.code)
      return
    }
    if (inFlight.current) return

    inFlight.current = true
    lastAttempt.current = candidate
    setVerifying(true)
    setError(null)
    setFieldError(null)
    setNotice(null)

    try {
      const result = await verifyMfa({
        mfaToken,
        code: candidate,
      })

      authActions.completeSignIn(result)
      setDemoCode(null)
      queryClient.setQueryData(authKeys.session, { user: result.user })

      await navigate({ to: redirect ?? '/' })
    } catch (caught) {
      if (!(caught instanceof ApiError)) {
        setError('We could not verify that code. Please try again.')
        return
      }

      if (
        caught.code === 'TOO_MANY_ATTEMPTS' ||
        caught.code === 'CHALLENGE_EXPIRED' ||
        caught.code === 'CHALLENGE_NOT_FOUND'
      ) {
        authActions.cancelMfa()
        setDemoCode(null)
        await navigate({ to: '/login', search: { redirect } })
        return
      }

      setCode('')
      setFieldError(caught.message)
      if (caught.challenge) authActions.updateChallenge(caught.challenge)
    } finally {
      inFlight.current = false
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setFieldError(null)
    setCode('')
    lastAttempt.current = null
    setResending(true)

    try {
      const result = await resendMfa({ mfaToken })
      authActions.updateChallenge(result.challenge)
      setDemoCode(result.devCode)
      setNotice('A new code is on its way.')
    } catch {
      authActions.cancelMfa()
      await navigate({ to: '/login', search: { redirect } })
    } finally {
      setResending(false)
    }
  }

  const methodLabel =
    challenge.method === 'email_otp'
      ? `We emailed a ${challenge.digits}-digit code to ${challenge.destination}.`
      : `Open ${challenge.destination} and enter the ${challenge.digits}-digit code for ${email}.`

  return (
    <div className="flex flex-col gap-5">
      <Callout tone="info">{methodLabel}</Callout>

      {demoCode ? (
        <div className="rounded-control border border-dashed border-steel-300 bg-steel-50 px-4 py-3">
          <p className="font-mono text-[10px] tracking-[0.18em] text-steel-500 uppercase">
            Demo mode · code the mock API "sent"
          </p>
          <p
            data-testid="demo-otp"
            className="mt-1 font-mono text-xl font-semibold tracking-[0.35em] text-ink-900"
          >
            {demoCode}
          </p>
        </div>
      ) : null}

      {error ? (
        <Callout tone="danger" role="alert" title="Verification failed">
          {error}
        </Callout>
      ) : null}

      {notice ? <Callout tone="success">{notice}</Callout> : null}

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit(code)
        }}
        className="flex flex-col gap-5"
      >
        <OtpInput
          label="Verification code"
          value={code}
          onChange={(next) => {
            setCode(next)
            setFieldError(null)
            if (
              next.length === challenge.digits &&
              next !== lastAttempt.current &&
              !expired
            ) {
              void submit(next)
            }
          }}
          digits={challenge.digits}
          error={fieldError ?? undefined}
          disabled={expired}
          autoFocus
        />

        <p
          className="text-[13px] text-steel-500"
          role={expired ? 'alert' : undefined}
        >
          {expired ? (
            <span className="font-medium text-danger-700">
              This code has expired. Request a new one to continue.
            </span>
          ) : (
            <>
              Code expires in{' '}
              <span className="font-mono text-ink-800">
                {formatDuration(remaining)}
              </span>
            </>
          )}
        </p>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={verifying}
          disabled={expired}
        >
          {verifying ? 'Verifying…' : 'Verify and continue'}
        </Button>
      </form>

      <div className="flex items-center justify-between gap-3 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          loading={resending}
        >
          Resend code
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            authActions.cancelMfa()
            setDemoCode(null)
            await navigate({ to: '/login', search: { redirect } })
          }}
        >
          Use a different account
        </Button>
      </div>
    </div>
  )
}
