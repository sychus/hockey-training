import type { Session } from '../../types'

interface SessionCardProps {
  session: Session
  onEdit: (session: Session) => void
  onDelete: (id: string) => void
  onShare: (session: Session) => void
}

export function SessionCard({ session, onEdit, onDelete, onShare }: SessionCardProps) {
  const playCount = session.plays.length
  const updatedAt = new Date(session.updatedAt).toLocaleDateString('es-AR')

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
      <h3 className="text-white font-bold text-lg">{session.title}</h3>
      {session.description && (
        <p className="text-gray-400 text-sm">{session.description}</p>
      )}
      <div className="text-gray-500 text-xs">
        {playCount} jugada{playCount !== 1 ? 's' : ''} · Actualizada {updatedAt}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onEdit(session)}
          className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm"
        >
          Editar
        </button>
        <button
          onClick={() => onShare(session)}
          className="px-3 py-1 rounded bg-green-700 hover:bg-green-600 text-white text-sm"
        >
          Compartir
        </button>
        <button
          onClick={() => onDelete(session.id)}
          className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-sm ml-auto"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
