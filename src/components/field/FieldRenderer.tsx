import { Layer } from 'react-konva'
import { HockeyField } from './HockeyField'
import {
  PlayerToken,
  BallToken,
  ConeToken,
  GoalToken,
  HurdleToken,
  ArrowLine,
  TextNote,
} from './elements'
import type { FieldElement } from '../../types'

interface FieldRendererProps {
  width: number
  height: number
  elements: FieldElement[]
  draggable?: boolean
  selectedElementId?: string | null
  onElementDragEnd?: (id: string, x: number, y: number) => void
  onElementSelect?: (id: string) => void
  onElementUpdate?: (id: string, updates: Partial<FieldElement>) => void
}

export function FieldRenderer({
  width,
  height,
  elements,
  draggable = false,
  selectedElementId,
  onElementDragEnd,
  onElementSelect,
  onElementUpdate,
}: FieldRendererProps) {
  const commonProps = {
    fieldWidth: width,
    fieldHeight: height,
    draggable,
    onDragEnd: onElementDragEnd,
    onSelect: onElementSelect,
  }

  const renderElement = (element: FieldElement) => {
    const isSelected = element.id === selectedElementId
    switch (element.type) {
      case 'player':
        return <PlayerToken key={element.id} element={element} {...commonProps} />
      case 'ball':
        return <BallToken key={element.id} element={element} {...commonProps} />
      case 'cone':
        return <ConeToken key={element.id} element={element} {...commonProps} />
      case 'goal':
      case 'mini-goal':
        return (
          <GoalToken
            key={element.id}
            element={element}
            {...commonProps}
            selected={isSelected}
            onUpdate={onElementUpdate}
          />
        )
      case 'hurdle':
        return (
          <HurdleToken
            key={element.id}
            element={element}
            {...commonProps}
            selected={isSelected}
            onUpdate={onElementUpdate}
          />
        )
      case 'arrow':
        return (
          <ArrowLine
            key={element.id}
            element={element}
            {...commonProps}
            selected={isSelected}
            onUpdate={onElementUpdate}
          />
        )
      case 'text':
        return (
          <TextNote
            key={element.id}
            element={element}
            {...commonProps}
            selected={isSelected}
            onUpdate={onElementUpdate}
          />
        )
    }
  }

  // Arrows below everything, then the rest
  const arrows = elements.filter((el) => el.type === 'arrow')
  const nonArrows = elements.filter((el) => el.type !== 'arrow')

  return (
    <>
      <Layer>
        <HockeyField width={width} height={height} />
      </Layer>
      <Layer>
        {arrows.map(renderElement)}
        {nonArrows.map(renderElement)}
      </Layer>
    </>
  )
}
