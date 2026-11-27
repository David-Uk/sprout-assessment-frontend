import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiRequestError, createTask, getTasks, updateTaskStatus } from '../api/client'

describe('API client', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000/api')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('uses the configured base URL and passes filters as query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], count: 0, page: 1, limit: 100, total: 0 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await getTasks('pending')

    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('http://localhost:3000/api/tasks?')
    expect(url).toContain('status=pending')
  })

  it('normalises network failures as API unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    await expect(createTask({ title: 'Test task' })).rejects.toThrow(ApiRequestError)
    await expect(createTask({ title: 'Test task' })).rejects.toThrow(/API unreachable/i)
  })

  it('reports a missing base URL as a configuration error, not a network failure', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(getTasks()).rejects.toThrow(/VITE_API_BASE_URL is not configured/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses the API error message for a bad request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { code: 'VALIDATION_ERROR', message: 'Invalid title' } }),
      })
    )

    await expect(updateTaskStatus(1, 'completed')).rejects.toThrow('Invalid title')
  })
})
