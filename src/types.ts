export type Status = 'pending' | 'in_progress' | 'completed'
export type StatusFilter = Status | 'all'

export interface Task {
  id: string | number
  title: string
  description: string
  status: Status
  created_at: string
  updated_at?: string
}

export interface TaskListResponse {
  data: Task[]
  count: number
  page: number
  limit: number
  total: number
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: Status
}

export const STATUS_LABELS: Record<Status, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}
