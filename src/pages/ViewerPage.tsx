import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { SessionViewer } from '../components/viewer/SessionViewer'
import { getSession } from '../api/sessions'
import type { Session } from '../types'

export function ViewerPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    getSession(sessionId)
      .then(setSession)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-400">
        Cargando sesión...
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-white mb-2">Sesión no disponible</h1>
          <p className="text-gray-400">
            Esta sesión fue eliminada o el link es incorrecto.
          </p>
        </div>
      </div>
    )
  }

  return <SessionViewer session={session} />
}
