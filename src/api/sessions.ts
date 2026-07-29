import type { Session } from '../types'

function getToken(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') ?? ''
}

function apiUrl(path: string): string {
  return `/api${path}`
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(error.error ?? `Error ${res.status}`)
  }

  return res.json()
}

export async function listSessions(): Promise<Session[]> {
  return apiFetch<Session[]>('/sessions')
}

export async function getSession(id: string): Promise<Session> {
  // Lectura pública, no necesita token
  const res = await fetch(apiUrl(`/sessions/${id}`))
  if (!res.ok) throw new Error('Sesión no encontrada')
  return res.json()
}

export async function createSession(session: Session): Promise<Session> {
  return apiFetch<Session>('/sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  })
}

export async function updateSession(session: Session): Promise<Session> {
  return apiFetch<Session>(`/sessions/${session.id}`, {
    method: 'PUT',
    body: JSON.stringify(session),
  })
}

export async function deleteSession(id: string): Promise<void> {
  await apiFetch(`/sessions/${id}`, { method: 'DELETE' })
}
