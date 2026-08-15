import { useState } from 'react'

import { Button } from '#/components/ui/Button'
import { Callout } from '#/components/ui/Callout'
import { Modal } from '#/components/ui/Modal'
import { TextField } from '#/components/ui/TextField'
import { ApiError } from '#/lib/api-client'

import type { Connector, ConnectorPatch } from '../types'
import type { FormEvent } from 'react'

const SEGMENTS = ['production', 'analytics', 'corporate', 'sandbox']

export function EditConnectorDialog({
  connector,
  onClose,
  onSave,
  saving,
}: {
  connector: Connector | null
  onClose: () => void
  onSave: (patch: ConnectorPatch) => Promise<void>
  saving: boolean
}) {
  const [name, setName] = useState(connector?.name ?? '')
  const [segment, setSegment] = useState(connector?.segment ?? SEGMENTS[0]!)
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!connector) return

    const trimmed = name.trim()
    if (!/^[a-z0-9-]{3,40}$/.test(trimmed)) {
      setNameError('Use 3–40 lowercase letters, numbers or hyphens.')
      return
    }

    setError(null)
    setNameError(null)

    try {
      await onSave({ name: trimmed, segment })
      onClose()
    } catch (caught) {
      if (caught instanceof ApiError && caught.fields?.name) {
        setNameError(caught.fields.name)
        return
      }
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'We could not save those changes. Please try again.',
      )
    }
  }

  return (
    <Modal
      open={connector !== null}
      onClose={onClose}
      title="Edit connector"
      description={
        connector ? `${connector.kind} · ${connector.cxp}` : undefined
      }
    >
      <form onSubmit={submit} noValidate>
        <div className="flex flex-col gap-5 px-6 py-5">
          {error ? (
            <Callout tone="danger" role="alert">
              {error}
            </Callout>
          ) : null}

          <TextField
            label="Connector name"
            value={name}
            error={nameError ?? undefined}
            hint="Lowercase letters, numbers and hyphens."
            onChange={(event) => {
              setName(event.target.value)
              setNameError(null)
            }}
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="connector-segment"
              className="text-[13px] font-medium tracking-wide text-ink-700"
            >
              Segment
            </label>
            <select
              id="connector-segment"
              value={segment}
              onChange={(event) => setSegment(event.target.value)}
              className="h-11 rounded-control border border-steel-200 bg-white px-3 text-[15px]
                text-ink-900 hover:border-steel-300 focus:border-brand-500 focus:outline-none
                focus:ring-3 focus:ring-brand-500/15"
            >
              {SEGMENTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-steel-100 bg-steel-50 px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </footer>
      </form>
    </Modal>
  )
}
