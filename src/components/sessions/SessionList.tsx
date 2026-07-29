import { useEffect, useState } from 'react'
import { SessionCard } from './SessionCard'
import { ShareModal } from '../ui/ShareModal'
import {
  listSessions,
  deleteSession as apiDeleteSession,
  createSession as apiCreateSession,
} from '../../api/sessions'
import { createSession as createSessionFactory } from '../../domain/factories'
import type { Session } from '../../types'

interface SessionListProps {
  onEditSession: (session: Session) => void
}

export function SessionList({ onEditSession }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    setLoading(true)
    setError(null)
    try {
      const data = await listSessions()
      setSessions(data)
    } catch {
      setError('Error cargando sesiones. Verificá tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    const title = newTitle.trim() || 'Nueva Sesión'
    const session = createSessionFactory({ title })
    try {
      await apiCreateSession(session)
      setNewTitle('')
      onEditSession(session)
    } catch {
      setError('Error creando la sesión.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta sesión? Los links compartidos dejarán de funcionar.')) return
    try {
      await apiDeleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setError('Error eliminando la sesión.')
    }
  }

  function handleShare(session: Session) {
    const url = `${window.location.origin}/s/${session.id}`
    setShareUrl(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <p className="text-gray-400">Cargando sesiones...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Mis Sesiones</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-4 md:mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Nombre de la sesión..."
          className="flex-1 min-w-0 px-3 md:px-4 py-2 rounded bg-gray-800 text-white text-sm md:text-base placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleCreate}
          className="px-3 md:px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-bold text-sm md:text-base shrink-0"
        >
          Crear
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-500">No hay sesiones todavía. ¡Creá la primera!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={onEditSession}
              onDelete={handleDelete}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {shareUrl && (
        <ShareModal url={shareUrl} onClose={() => setShareUrl(null)} />
      )}
    </div>
  )
}
