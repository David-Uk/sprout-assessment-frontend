import { useCallback, useEffect, useRef, useState } from 'react'
import { createTask, getTasks, updateTaskStatus } from './api/client'
import StatusFilter from './components/StatusFilter'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import type { CreateTaskInput, Status, StatusFilter as Filter, Task } from './types'
import './App.css'

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function matchesFilter(task: Task, filter: Filter): boolean {
  return filter === 'all' || task.status === filter
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState<Task['id'] | null>(null)
  const [error, setError] = useState('')

  // Refs keep the callbacks stable, so memoized children do not rerender when
  // only unrelated App state changes.
  const filterRef = useRef<Filter>(filter)
  const creatingRef = useRef(false)
  const updatingIdRef = useRef<Task['id'] | null>(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getTasks(filterRef.current === 'all' ? undefined : filterRef.current)
      setTasks(result.data)
    } catch (err) {
      setTasks([])
      setError(messageOf(err, 'Could not load tasks.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Defer so the filter change renders before the loading state is set.
    void Promise.resolve().then(loadTasks)
  }, [filter, loadTasks])

  const handleFilterChange = useCallback((value: Filter) => {
    filterRef.current = value
    setFilter(value)
  }, [])

  const handleCreate = useCallback(async (input: CreateTaskInput) => {
    if (creatingRef.current) return
    creatingRef.current = true
    setCreating(true)
    setError('')
    try {
      const { data } = await createTask(input)
      // Insert just the new task instead of refetching the whole list.
      setTasks((prev) => (matchesFilter(data, filterRef.current) ? [data, ...prev] : prev))
    } catch (err) {
      const message = messageOf(err, 'Could not create the task.')
      setError(message)
      throw err
    } finally {
      creatingRef.current = false
      setCreating(false)
    }
  }, [])

  const handleStatusChange = useCallback(async (task: Task, status: Status) => {
    if (updatingIdRef.current !== null) return
    updatingIdRef.current = task.id
    setUpdatingId(task.id)
    setError('')
    try {
      const { data } = await updateTaskStatus(task.id, status)
      // Replace only the updated task; untouched task objects keep their
      // identity so their memoized cards skip rendering.
      setTasks((prev) =>
        prev.flatMap((item) => {
          if (item.id !== task.id) return [item]
          const updated: Task = { ...item, ...data }
          return matchesFilter(updated, filterRef.current) ? [updated] : []
        })
      )
    } catch (err) {
      setError(messageOf(err, 'Could not update the task.'))
    } finally {
      updatingIdRef.current = null
      setUpdatingId(null)
    }
  }, [])

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
            <StatusFilter value={filter} onChange={handleFilterChange} disabled={loading} />
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
