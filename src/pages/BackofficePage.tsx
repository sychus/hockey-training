import { useState } from 'react'
import { SessionList } from '../components/sessions/SessionList'
import { EditorLayout } from '../components/editor/EditorLayout'
import { AuthGuard } from '../components/ui/AuthGuard'
import { useEditorStore } from '../stores/editor-store'
import type { Session } from '../types'

export function BackofficePage() {
  const [view, setView] = useState<'list' | 'editor'>('list')
  const setSession = useEditorStore((s) => s.setSession)

  function handleEditSession(session: Session) {
    setSession(session)
    setView('editor')
  }

  function handleBackToList() {
    setView('list')
  }

  return (
    <AuthGuard>
      {view === 'editor' ? (
        <div>
          <div className="bg-gray-900 p-2 flex items-center">
            <button
              onClick={handleBackToList}
              className="text-gray-400 hover:text-white text-sm px-3 py-1"
            >
              ← Volver a sesiones
            </button>
          </div>
          <EditorLayout />
        </div>
      ) : (
        <SessionList onEditSession={handleEditSession} />
      )}
    </AuthGuard>
  )
}
