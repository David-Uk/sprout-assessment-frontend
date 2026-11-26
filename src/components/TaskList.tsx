import type { Status, Task } from '../types'
import { STATUS_LABELS } from '../types'

interface Props {
  tasks: Task[]
  loading: boolean
  updatingId: Task['id'] | null
  onStatusChange: (task: Task, status: Status) => void
}

export default function TaskList({ tasks, loading, updatingId, onStatusChange }: Props) {
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
        <li className="task-card" key={task.id}>
          <div className="task-heading">
            <h3>{task.title}</h3>
            <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
          </div>
          {task.description && <p className="task-description">{task.description}</p>}
          <div className="task-actions">
            <label htmlFor={`status-${task.id}`}>Status</label>
            <select
              id={`status-${task.id}`}
              value={task.status}
              disabled={updatingId === task.id}
              onChange={(event) => onStatusChange(task, event.target.value as Status)}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
            {updatingId === task.id && (
              <span className="inline-loading" role="status">
                Saving…
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
