import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { createTask, getTasks, updateTaskStatus } from '../api/client'
import type { Task } from '../types'

vi.mock('../api/client', () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTaskStatus: vi.fn(),
}))

const sampleTask: Task = {
  id: '1',
  title: 'Write tests',
  description: '',
  status: 'pending',
  created_at: '2026-01-01T00:00:00.000Z',
}

describe('Task manager UI', () => {
  beforeEach(() => {
    vi.mocked(getTasks).mockResolvedValue({
      data: [sampleTask],
      count: 1,
      page: 1,
      limit: 100,
      total: 1,
    })
  })

  it('loads and displays tasks', async () => {
    render(<App />)
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument()
    expect(await screen.findByText('Write tests')).toBeInTheDocument()
  })

  it('shows an empty state when there are no tasks', async () => {
    vi.mocked(getTasks).mockResolvedValue({
      data: [],
      count: 0,
      page: 1,
      limit: 100,
      total: 0,
    })
    render(<App />)
    expect(await screen.findByText(/no tasks yet/i)).toBeInTheDocument()
  })

  it('requests only the selected status when filtering', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Write tests')

    await user.click(screen.getByLabelText('Completed'))

    await waitFor(() => expect(getTasks).toHaveBeenLastCalledWith('completed'))
  })

  it('creates a task and refreshes the list', async () => {
    const user = userEvent.setup()
    vi.mocked(createTask).mockResolvedValue({ data: sampleTask })
    render(<App />)
    await screen.findByText('Write tests')

    await user.type(screen.getByLabelText('Title'), 'New task')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() =>
      expect(createTask).toHaveBeenCalledWith({
        title: 'New task',
        description: '',
        status: 'pending',
      })
    )
  })

  it('updates a task status', async () => {
    const user = userEvent.setup()
    vi.mocked(updateTaskStatus).mockResolvedValue({ data: { ...sampleTask, status: 'completed' } })
    render(<App />)
    await screen.findByText('Write tests')

    await user.selectOptions(screen.getByLabelText('Status', { selector: '#status-1' }), 'completed')

    await waitFor(() => expect(updateTaskStatus).toHaveBeenCalledWith('1', 'completed'))
  })

  it('shows an error when the API is unreachable', async () => {
    vi.mocked(getTasks).mockRejectedValue(new Error('API unreachable. Check that the backend is running.'))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/api unreachable/i)
  })
})
