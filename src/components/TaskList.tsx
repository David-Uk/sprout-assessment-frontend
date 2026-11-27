import { memo } from 'react'
import { TaskCard } from './TaskCard'
import type { Status, Task } from '../types'

interface Props {
  tasks: Task[]
  loading: boolean
  updatingId: Task['id'] | null
  onStatusChange: (task: Task, status: Status) => void
}

function TaskList({ tasks, loading, updatingId, onStatusChange }: Props) {
  if (loading) {
    return (
      <p className="status-message" role="status">
        Loading tasks…
      </p>
    )
  }

  if (tasks.length === 0) {
    return (
      <p className="status-message" role="status">
        No tasks yet
      </p>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          updating={updatingId === task.id}
          onStatusChange={onStatusChange}
        />
      ))}
    </ul>
  )
}

export default memo(TaskList)
