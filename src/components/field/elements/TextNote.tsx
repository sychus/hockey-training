import { Text, Group } from 'react-konva'
import type { TextElement } from '../../../types'

interface TextNoteProps {
  element: TextElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function TextNote({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: TextNoteProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      onDragEnd={(e) => {
        const newX = (e.target.x() / fieldWidth) * 100
        const newY = (e.target.y() / fieldHeight) * 100
        onDragEnd?.(element.id, newX, newY)
      }}
      onClick={() => onSelect?.(element.id)}
      onTap={() => onSelect?.(element.id)}
    >
      <Text
        text={element.content}
        fontSize={element.fontSize ?? 14}
        fill="#ffffff"
        fontStyle="bold"
        shadowColor="#000"
        shadowBlur={2}
        shadowOffset={{ x: 1, y: 1 }}
      />
    </Group>
  )
}
