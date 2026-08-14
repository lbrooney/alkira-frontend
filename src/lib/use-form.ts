import { useCallback, useMemo, useRef, useState } from 'react'

import type { FieldErrors } from '#/features/auth/validation'

export interface SubmitHelpers<TField extends string> {
  setServerErrors: (errors: FieldErrors<TField>) => void
}

export interface UseFormOptions<TValues, TField extends string> {
  initialValues: TValues
  validate: (values: TValues) => FieldErrors<TField>
  onSubmit: (
    values: TValues,
    helpers: SubmitHelpers<TField>,
  ) => void | Promise<void>
}

export function useForm<TValues extends object, TField extends string>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<TValues, TField>) {
  const [values, setValues] = useState<TValues>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<TField, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<FieldErrors<TField>>({})
  const [submitting, setSubmitting] = useState(false)

  const inFlight = useRef(false)

  const clientErrors = useMemo(() => validate(values), [validate, values])

  const errors = useMemo(() => {
    const result: FieldErrors<TField> = {}
    for (const [field, message] of Object.entries(clientErrors) as Array<
      [TField, string | undefined]
    >) {
      if (message && (submitAttempted || touched[field]))
        result[field] = message
    }
    for (const [field, message] of Object.entries(serverErrors) as Array<
      [TField, string | undefined]
    >) {
      if (message) result[field] = message
    }
    return result
  }, [clientErrors, serverErrors, submitAttempted, touched])

  const setField = useCallback(
    (field: keyof TValues & TField, value: string) => {
      setValues((current) => ({ ...current, [field]: value }))
      setServerErrors((current) => {
        if (!(field in current)) return current
        const next = { ...current }
        delete next[field]
        return next
      })
    },
    [],
  )

  const handleBlur = useCallback((field: TField) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }, [])

  const handleSubmit = useCallback(
    async (event?: { preventDefault: () => void }) => {
      event?.preventDefault()
      setSubmitAttempted(true)
      setServerErrors({})

      if (Object.keys(validate(values)).length > 0) return
      if (inFlight.current) return

      inFlight.current = true
      setSubmitting(true)
      try {
        await onSubmit(values, { setServerErrors })
      } finally {
        inFlight.current = false
        setSubmitting(false)
      }
    },
    [onSubmit, validate, values],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setTouched({})
    setSubmitAttempted(false)
    setServerErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    submitting,
    setField,
    handleBlur,
    handleSubmit,
    reset,
  }
}
