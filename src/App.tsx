import { useCallback, useEffect, useState } from 'react'
import { createTask, getTasks, updateTaskStatus } from './api/client'
import StatusFilter from './components/StatusFilter'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import type { CreateTaskInput, Status, StatusFilter as Filter, Task } from './types'
import './App.css'

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState<Task['id'] | null>(null)
  const [error, setError] = useState('')

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getTasks(filter === 'all' ? undefined : filter)
      setTasks(result.data)
    } catch (err) {
      setTasks([])
      setError(messageOf(err, 'Could not load tasks.'))
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    // Defer so the filter change renders before the loading state is set.
    void Promise.resolve().then(loadTasks)
  }, [loadTasks])

  async function handleCreate(input: CreateTaskInput) {
    if (creating) return
    setCreating(true)
    setError('')
    try {
      await createTask(input)
      await loadTasks()
    } catch (err) {
      const message = messageOf(err, 'Could not create the task.')
      setError(message)
      throw err
    } finally {
      setCreating(false)
    }
  }

  async function handleStatusChange(task: Task, status: Status) {
    if (updatingId !== null) return
    setUpdatingId(task.id)
    setError('')
    try {
      await updateTaskStatus(task.id, status)
      await loadTasks()
    } catch (err) {
      setError(messageOf(err, 'Could not update the task.'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <p>Create tasks, filter them by status and update their progress.</p>
      </header>
      <main className="app-main">
        <TaskForm onSubmit={handleCreate} busy={creating} />
        <section className="tasks-panel" aria-labelledby="tasks-heading">
          <div className="tasks-toolbar">
            <h2 id="tasks-heading">Tasks</h2>
            <StatusFilter value={filter} onChange={setFilter} disabled={loading} />
          </div>
          <div className="notifications" aria-live="polite">
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </div>
          <TaskList
            tasks={tasks}
            loading={loading}
            updatingId={updatingId}
            onStatusChange={handleStatusChange}
          />
        </section>
      </main>
    </div>
  )
}
