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
export type Grant = {
  id: string
  title: string
  funder: string
  summary: string
  eligibility_text: string
  focus_areas: string[]
  eligible_regions: string[]
  applicant_types: string[]
  amount_min_cents: number | null
  amount_max_cents: number | null
  deadline: string | null
  application_url: string
  canonical_url: string
  last_verified_at: string
  source_name: string
  source_type: string
  match_score: number | null
  match_reasons: string[]
  missing_criteria: string[]
  is_saved: boolean
}
export type GrantList = { items: Grant[]; page: number; page_size: number; total: number }
export type SavedGrant = { id: string; status: string; notes: string; follow_up_at: string | null; created_at: string; grant: Grant }
export type Dashboard = { saved_count: number; active_count: number; applied_count: number; pipeline_amount_cents: number; upcoming_deadlines: SavedGrant[] }

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
  grants: (params: { search?: string; focus_area?: string; region?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, String(value)) })
    return request<GrantList>(`/api/v1/grants?${query.toString()}`)
  },
  savedGrants: () => request<SavedGrant[]>('/api/v1/saved-grants'),
  saveGrant: (grant_id: string) => request<SavedGrant>('/api/v1/saved-grants', { method: 'POST', body: JSON.stringify({ grant_id }) }),
  updateSavedGrant: (id: string, payload: { status: string; notes: string; follow_up_at: string | null }) =>
    request<SavedGrant>(`/api/v1/saved-grants/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteSavedGrant: (id: string) => request<void>(`/api/v1/saved-grants/${id}`, { method: 'DELETE' }),
  dashboard: () => request<Dashboard>('/api/v1/dashboard'),
}
