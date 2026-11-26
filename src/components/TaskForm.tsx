import { useState, type FormEvent } from 'react'
import type { CreateTaskInput, Status } from '../types'
import { STATUS_LABELS } from '../types'

interface Props {
  onSubmit: (input: CreateTaskInput) => Promise<void>
  busy: boolean
}

export default function TaskForm({ onSubmit, busy }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('pending')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    const trimmed = title.trim()
    if (!trimmed) {
      setError('Title is required.')
      return
    }
    if (trimmed.length > 150) {
      setError('Title must be 150 characters or fewer.')
      return
    }
    if (description.length > 1000) {
      setError('Description must be 1000 characters or fewer.')
      return
    }

    setError('')
    try {
      await onSubmit({ title: trimmed, description, status })
      setTitle('')
      setDescription('')
      setStatus('pending')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the task.')
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>New task</h2>
      <div className="field">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={150}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'form-error' : undefined}
        />
      </div>
      <div className="field">
        <label htmlFor="task-description">Description (optional)</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={1000}
          rows={3}
        />
      </div>
      <div className="field">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as Status)}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={busy}>
        {busy ? 'Creating…' : 'Add task'}
      </button>
      {error && (
        <p className="error" id="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
