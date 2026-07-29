import { useState, useRef, useEffect } from 'react'
import { Text, Circle, Group, Rect } from 'react-konva'
import type { TextElement } from '../../../types'

interface TextNoteProps {
  element: TextElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  selected?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
  onUpdate?: (id: string, updates: Partial<TextElement>) => void
}

const HANDLE_RADIUS = 7
const HANDLE_DISTANCE = 30

export function TextNote({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  selected = false,
  onDragEnd,
  onSelect,
  onUpdate,
}: TextNoteProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const [editing, setEditing] = useState(false)
  const textRef = useRef<any>(null)

  const fontSize = element.fontSize ?? 14

  // When entering edit mode, create an HTML textarea over the canvas
  useEffect(() => {
    if (!editing || !textRef.current) return

    const stage = textRef.current.getStage()
    if (!stage) return

    const stageContainer = stage.container()
    const stageRect = stageContainer.getBoundingClientRect()

    // Get the text node's absolute position
    const absPos = textRef.current.getAbsolutePosition()

    const textarea = document.createElement('textarea')
    textarea.value = element.content
    textarea.style.position = 'fixed'
    textarea.style.left = `${stageRect.left + absPos.x}px`
    textarea.style.top = `${stageRect.top + absPos.y}px`
    textarea.style.fontSize = `${fontSize}px`
    textarea.style.fontWeight = 'bold'
    textarea.style.color = '#ffffff'
    textarea.style.background = 'rgba(0,0,0,0.8)'
    textarea.style.border = '1px solid #3b82f6'
    textarea.style.borderRadius = '4px'
    textarea.style.padding = '4px 6px'
    textarea.style.outline = 'none'
    textarea.style.resize = 'none'
    textarea.style.minWidth = '80px'
    textarea.style.minHeight = '30px'
    textarea.style.zIndex = '1000'
    textarea.style.fontFamily = 'sans-serif'

    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const finish = () => {
      const newContent = textarea.value.trim()
      if (newContent && newContent !== element.content) {
        onUpdate?.(element.id, { content: newContent })
      }
      textarea.remove()
      setEditing(false)
    }

    textarea.addEventListener('blur', finish)
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        finish()
      }
      if (e.key === 'Escape') {
        textarea.remove()
        setEditing(false)
      }
    })

    return () => {
      if (textarea.parentNode) textarea.remove()
    }
  }, [editing, element.content, element.id, fontSize, onUpdate])

  return (
    <Group>
      <Group
        x={x}
        y={y}
        rotation={element.rotation ?? 0}
        draggable={draggable}
        onDragEnd={(e) => {
          const newX = (e.target.x() / fieldWidth) * 100
          const newY = (e.target.y() / fieldHeight) * 100
          onDragEnd?.(element.id, newX, newY)
        }}
        onClick={() => onSelect?.(element.id)}
        onTap={() => onSelect?.(element.id)}
        onDblClick={() => draggable && setEditing(true)}
        onDblTap={() => draggable && setEditing(true)}
      >
        {/* Selection highlight */}
        {selected && (
          <Rect
            x={-3}
            y={-3}
            width={(element.content.length * fontSize * 0.6) + 6}
            height={fontSize + 10}
            stroke="#3b82f6"
            strokeWidth={1}
            dash={[4, 2]}
            fill="transparent"
            cornerRadius={3}
          />
        )}
        <Text
          ref={textRef}
          text={element.content}
          fontSize={fontSize}
          fill="#ffffff"
          fontStyle="bold"
          shadowColor="#000"
          shadowBlur={2}
          shadowOffset={{ x: 1, y: 1 }}
        />
      </Group>

      {/* Rotation handle */}
      {selected && draggable && (
        <Circle
          x={x}
          y={y - HANDLE_DISTANCE}
          radius={HANDLE_RADIUS}
          fill="#3b82f6"
          stroke="#fff"
          strokeWidth={2}
          draggable
          onDragEnd={(e) => {
            const handleX = e.target.x()
            const handleY = e.target.y()
            const angle = Math.atan2(handleY - y, handleX - x)
            const degrees = (angle * 180) / Math.PI + 90
            onUpdate?.(element.id, { rotation: degrees })
          }}
        />
      )}
    </Group>
  )
}
