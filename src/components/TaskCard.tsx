import { memo } from 'react'
import type { Status, Task } from '../types'
import { STATUS_LABELS } from '../types'

interface Props {
  task: Task
  updating: boolean
  onStatusChange: (task: Task, status: Status) => void
}

// Memoised so a status change on one task does not rerender the other cards.
const TaskCard = memo(function TaskCard({ task, updating, onStatusChange }: Props) {
  return (
    <li className="task-card">
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
          disabled={updating}
          onChange={(event) => onStatusChange(task, event.target.value as Status)}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        {updating && (
          <span className="inline-loading" role="status">
            Saving…
          </span>
        )}
      </div>
    </li>
  )
})

export { TaskCard }
