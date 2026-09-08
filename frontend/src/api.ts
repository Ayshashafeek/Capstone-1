const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type Organization = {
  id: string
  name: string
  description: string
  organization_type: string
  regions: string
  focus_areas: string
  annual_budget_cents: number | null
  team_size: number | null
  updated_at: string
}

export type User = { id: string; email: string; role: string }
export type Me = { user: User; organization: Organization }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? 'Something went wrong')
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export const api = {
  me: () => request<Me>('/api/v1/auth/me'),
  signup: (payload: { email: string; password: string; organization_name: string }) =>
    request<Me>('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<Me>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request<void>('/api/v1/auth/logout', { method: 'POST' }),
  updateOrganization: (payload: Omit<Organization, 'id' | 'updated_at'>) =>
    request<Organization>('/api/v1/organization', { method: 'PUT', body: JSON.stringify(payload) }),
}
