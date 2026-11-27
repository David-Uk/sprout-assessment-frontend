import type { CreateTaskInput, Status, Task, TaskListResponse } from '../types'

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

function baseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL
  if (!url) {
    throw new ApiRequestError('VITE_API_BASE_URL is not configured. Copy .env.example to .env.')
  }
  return url.replace(/\/$/, '')
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Resolve configuration outside the try/catch so a missing base URL is not
  // misreported as a network failure.
  const url = `${baseUrl()}${path}`
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
  } catch {
    throw new ApiRequestError(
      'API unreachable. Check that the backend is running and that this origin is allowed by CORS.'
    )
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (body?.error?.message) message = body.error.message
    } catch {
      // Keep the status-based message when the error body is not JSON.
    }
    throw new ApiRequestError(message)
  }

  return (await response.json()) as T
}

export function getTasks(status?: Status, page = 1, limit = 100): Promise<TaskListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) params.set('status', status)
  return request<TaskListResponse>(`/tasks?${params.toString()}`)
}

export function createTask(input: CreateTaskInput): Promise<{ data: Task }> {
  return request<{ data: Task }>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateTaskStatus(id: Task['id'], status: Status): Promise<{ data: Task }> {
  return request<{ data: Task }>(`/tasks/${encodeURIComponent(String(id))}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
