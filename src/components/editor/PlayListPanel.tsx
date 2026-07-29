import { useState } from 'react'
import { useEditorStore } from '../../stores/editor-store'
import { LimitIndicator } from '../ui/LimitIndicator'
import { MAX_PLAYS_PER_SESSION } from '../../lib/constants'

export function PlayListPanel() {
  const plays = useEditorStore((s) => s.session.plays)
  const activePlayIndex = useEditorStore((s) => s.activePlayIndex)
  const addPlay = useEditorStore((s) => s.addPlay)
  const removePlay = useEditorStore((s) => s.removePlay)
  const setActivePlay = useEditorStore((s) => s.setActivePlay)
  const reorderPlays = useEditorStore((s) => s.reorderPlays)

  const [newPlayTitle, setNewPlayTitle] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleAddPlay = () => {
    const title = newPlayTitle.trim() || `Jugada ${plays.length + 1}`
    addPlay(title)
    setNewPlayTitle('')
    setActivePlay(plays.length)
  }

  return (
    <>
      {/* Desktop: sidebar */}
      <div className="hidden md:flex bg-gray-900 p-4 rounded-lg w-64 flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold">Jugadas</h2>
          <LimitIndicator current={plays.length} max={MAX_PLAYS_PER_SESSION} label="" />
        </div>

        <div className="flex gap-1">
          <input
            type="text"
            value={newPlayTitle}
            onChange={(e) => setNewPlayTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlay()}
            placeholder="Nombre de jugada..."
            className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-sm placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            disabled={plays.length >= MAX_PLAYS_PER_SESSION}
            onClick={handleAddPlay}
            className="px-3 py-1 rounded bg-green-700 hover:bg-green-600 text-white text-sm disabled:opacity-30"
          >
            +
          </button>
        </div>

        <ul className="flex flex-col gap-1 overflow-y-auto max-h-[400px]">
          {plays.map((play, index) => (
            <PlayItem
              key={play.id}
              title={play.title}
              isActive={index === activePlayIndex}
              index={index}
              totalPlays={plays.length}
              onSelect={() => setActivePlay(index)}
              onMoveUp={() => reorderPlays(index, index - 1)}
              onMoveDown={() => reorderPlays(index, index + 1)}
              onRemove={() => removePlay(play.id)}
            />
          ))}
        </ul>

        {plays.length === 0 && (
          <p className="text-gray-500 text-sm text-center">Agregá tu primera jugada</p>
        )}
      </div>

      {/* Mobile: collapsible top bar */}
      <div className="md:hidden bg-gray-900 rounded-lg">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 text-white"
        >
          <span className="font-bold text-sm">
            Jugadas {activePlayIndex >= 0 ? `— ${plays[activePlayIndex]?.title}` : ''}
          </span>
          <span className="flex items-center gap-2">
            <LimitIndicator current={plays.length} max={MAX_PLAYS_PER_SESSION} label="" />
            <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
          </span>
        </button>

        {expanded && (
          <div className="px-3 pb-3 flex flex-col gap-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={newPlayTitle}
                onChange={(e) => setNewPlayTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlay()}
                placeholder="Nombre de jugada..."
                className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-sm placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                disabled={plays.length >= MAX_PLAYS_PER_SESSION}
                onClick={handleAddPlay}
                className="px-3 py-1 rounded bg-green-700 hover:bg-green-600 text-white text-sm disabled:opacity-30"
              >
                +
              </button>
            </div>

            <ul className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
              {plays.map((play, index) => (
                <PlayItem
                  key={play.id}
                  title={play.title}
                  isActive={index === activePlayIndex}
                  index={index}
                  totalPlays={plays.length}
                  onSelect={() => {
                    setActivePlay(index)
                    setExpanded(false)
                  }}
                  onMoveUp={() => reorderPlays(index, index - 1)}
                  onMoveDown={() => reorderPlays(index, index + 1)}
                  onRemove={() => removePlay(play.id)}
                />
              ))}
            </ul>

            {plays.length === 0 && (
              <p className="text-gray-500 text-sm text-center">Agregá tu primera jugada</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function PlayItem({
  title,
  isActive,
  index,
  totalPlays,
  onSelect,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  title: string
  isActive: boolean
  index: number
  totalPlays: number
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  return (
    <li
      onClick={onSelect}
      className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer text-sm ${
        isActive
          ? 'bg-blue-700 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      <span className="truncate">{title}</span>
      <div className="flex gap-1 shrink-0">
        {index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp() }}
            className="text-xs opacity-50 hover:opacity-100"
          >
            ▲
          </button>
        )}
        {index < totalPlays - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown() }}
            className="text-xs opacity-50 hover:opacity-100"
          >
            ▼
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="text-xs text-red-400 opacity-50 hover:opacity-100 ml-1"
        >
          ✕
        </button>
      </div>
    </li>
  )
}
