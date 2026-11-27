import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { createTask, getTasks, updateTaskStatus } from '../api/client'
import type { Status, Task } from '../types'

const { renders } = vi.hoisted(() => ({ renders: {} as Record<string, number> }))

interface CardProps {
  task: Task
  updating: boolean
  onStatusChange: (task: Task, status: Status) => void
}

vi.mock('../api/client', () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTaskStatus: vi.fn(),
}))

// Count renders of each memoised task card without losing memoisation.
vi.mock('../components/TaskCard', async (importOriginal) => {
  const { memo } = await import('react')
  const actual = await importOriginal<typeof import('../components/TaskCard')>()
  return {
    TaskCard: memo((props: CardProps) => {
      const id = String(props.task.id)
      renders[id] = (renders[id] ?? 0) + 1
      return <actual.TaskCard {...props} />
    }),
  }
})

const taskA: Task = {
  id: '1',
  title: 'Task A',
  description: '',
  status: 'pending',
  created_at: '2026-01-01T00:00:00.000Z',
}
const taskB: Task = { ...taskA, id: '2', title: 'Task B' }
const newTask: Task = { ...taskA, id: '3', title: 'Task C' }

function list(tasks: Task[]) {
  return { data: tasks, count: tasks.length, page: 1, limit: 100, total: tasks.length }
}

describe('task update rendering', () => {
  beforeEach(() => {
    for (const key of Object.keys(renders)) delete renders[key]
    vi.mocked(getTasks).mockResolvedValue(list([taskA, taskB]))
    vi.mocked(createTask).mockReset()
    vi.mocked(updateTaskStatus).mockReset()
  })

  it('updates only the changed card without refetching the list', async () => {
    const user = userEvent.setup()
    vi.mocked(updateTaskStatus).mockResolvedValue({ data: { ...taskA, status: 'completed' } })

    render(<App />)
    await screen.findByText('Task A')
    await screen.findByText('Task B')
    expect(renders['1']).toBe(1)
    expect(renders['2']).toBe(1)
    expect(getTasks).toHaveBeenCalledTimes(1)

    await user.selectOptions(screen.getByLabelText('Status', { selector: '#status-1' }), 'completed')

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Task A' }).parentElement).toHaveTextContent(
        'Completed'
      )
    )
    expect(screen.getByLabelText('Status', { selector: '#status-2' })).toHaveValue('pending')
    expect(renders['2']).toBe(1)
    expect(renders['1']).toBeGreaterThan(1)
    expect(getTasks).toHaveBeenCalledTimes(1)
  })

  it('inserts a new task without refetching or rerendering existing cards', async () => {
    const user = userEvent.setup()
    vi.mocked(createTask).mockResolvedValue({ data: newTask })

    render(<App />)
    await screen.findByText('Task A')
    await screen.findByText('Task B')

    await user.type(screen.getByLabelText('Title'), 'Task C')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(await screen.findByText('Task C')).toBeInTheDocument()
    expect(getTasks).toHaveBeenCalledTimes(1)
    expect(renders['1']).toBe(1)
    expect(renders['2']).toBe(1)
    expect(renders['3']).toBe(1)
  })

  it('drops a task from a filtered list when its new status no longer matches', async () => {
    const user = userEvent.setup()
    vi.mocked(getTasks).mockImplementation(async (status) => list(status ? [taskA] : [taskA, taskB]))
    vi.mocked(updateTaskStatus).mockResolvedValue({ data: { ...taskA, status: 'completed' } })

    render(<App />)
    await screen.findByText('Task A')
    await user.click(screen.getByLabelText('Pending'))
    await waitFor(() => expect(getTasks).toHaveBeenLastCalledWith('pending'))
    await waitFor(() => expect(screen.queryByText('Task B')).not.toBeInTheDocument())

    await user.selectOptions(screen.getByLabelText('Status', { selector: '#status-1' }), 'completed')

    await waitFor(() => expect(screen.queryByText('Task A')).not.toBeInTheDocument())
    // Initial load and the filter change only — no refetch after the update.
    expect(getTasks).toHaveBeenCalledTimes(2)
  })
})
