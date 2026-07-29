import { useState } from 'react'
import type { FieldElement, TextElement, PlayerElement } from '../../types'

interface SelectedElementActionsProps {
  element: FieldElement | null
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<FieldElement>) => void
  onDeselect: () => void
}

export function SelectedElementActions({
  element,
  onDelete,
  onUpdate,
  onDeselect,
}: SelectedElementActionsProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  if (!element) return null

  const elementLabel = getElementLabel(element)
  const isEditable = element.type === 'text' || element.type === 'player'

  const handleStartEdit = () => {
    if (element.type === 'text') {
      setEditValue((element as TextElement).content)
    } else if (element.type === 'player') {
      setEditValue((element as PlayerElement).label)
    }
    setEditing(true)
  }

  const handleConfirmEdit = () => {
    const trimmed = editValue.trim()
    if (!trimmed) return
    if (element.type === 'text') {
      onUpdate(element.id, { content: trimmed } as Partial<TextElement>)
    } else if (element.type === 'player') {
      onUpdate(element.id, { label: trimmed } as Partial<PlayerElement>)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="w-full flex gap-1.5 items-center bg-gray-800 rounded-lg p-2 shrink-0">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirmEdit()
            if (e.key === 'Escape') setEditing(false)
          }}
          autoFocus
          className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleConfirmEdit}
          className="px-2 py-1 rounded bg-green-700 hover:bg-green-600 text-white text-xs"
        >
          OK
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white text-xs"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="w-full flex gap-1.5 items-center bg-gray-800 rounded-lg p-2 shrink-0">
      <span className="text-gray-400 text-xs truncate">{elementLabel}</span>
      <div className="ml-auto flex gap-1.5 shrink-0">
        {isEditable && (
          <button
            onClick={handleStartEdit}
            className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs"
          >
            Editar
          </button>
        )}
        <button
          onClick={() => {
            onDelete(element.id)
          }}
          className="px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-xs"
        >
          Eliminar
        </button>
        <button
          onClick={onDeselect}
          className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function getElementLabel(element: FieldElement): string {
  switch (element.type) {
    case 'player':
      return `Jugadora ${element.team === 'own' ? 'propia' : 'rival'} (${element.label})`
    case 'ball':
      return 'Pelota'
    case 'cone':
      return 'Cono'
    case 'goal':
      return 'Arco'
    case 'mini-goal':
      return 'Mini arco'
    case 'hurdle':
      return 'Valla'
    case 'arrow':
      return `Flecha (${element.style})`
    case 'text':
      return `Texto: "${element.content}"`
  }
}
