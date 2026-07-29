import { useState, useRef, useEffect } from 'react'
import { Stage } from 'react-konva'
import type Konva from 'konva'
import { FieldRenderer } from '../field/FieldRenderer'
import { PlaybackControls } from './PlaybackControls'
import { useAnimation } from '../../hooks/useAnimation'
import { FIELD } from '../../lib/constants'
import type { Session } from '../../types'

interface SessionViewerProps {
  session: Session
}

export function SessionViewer({ session }: SessionViewerProps) {
  const [activePlayIndex, setActivePlayIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [fieldWidth, setFieldWidth] = useState(350)

  const currentPlay = session.plays[activePlayIndex]

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setFieldWidth(Math.min(containerRef.current.clientWidth - 16, 500))
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Viewer has no draggable elements — let all touches pass through for scrolling
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const content = stage.container()
    content.style.touchAction = 'auto'
  })

  const fieldHeight = Math.round(fieldWidth * FIELD.ASPECT_RATIO)

  const {
    currentElements,
    isPlaying,
    currentStepIndex,
    play,
    pause,
    stop,
    nextStep,
    prevStep,
  } = useAnimation({
    steps: currentPlay?.steps ?? [],
    stepDurationMs: 1200,
  })

  if (session.plays.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-400">
        Esta sesión no tiene jugadas todavía.
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-3 text-center">
        <h1 className="text-white font-bold text-lg">{session.title}</h1>
        {session.description && (
          <p className="text-gray-400 text-sm mt-1">{session.description}</p>
        )}
      </div>

      {/* Play selector */}
      {session.plays.length > 1 && (
        <div className="flex overflow-x-auto gap-2 px-4 pb-2">
          {session.plays.map((play, index) => (
            <button
              key={play.id}
              onClick={() => {
                setActivePlayIndex(index)
                stop()
              }}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                index === activePlayIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {play.title}
            </button>
          ))}
        </div>
      )}

      {/* Play notes */}
      {currentPlay?.notes && (
        <div className="px-4 pb-2">
          <p className="text-gray-400 text-xs bg-gray-800 rounded p-2">
            {currentPlay.notes}
          </p>
        </div>
      )}

      {/* Field */}
      <div ref={containerRef} className="flex-1 flex justify-center items-center p-2">
        <Stage ref={stageRef} width={fieldWidth} height={fieldHeight}>
          <FieldRenderer
            width={fieldWidth}
            height={fieldHeight}
            elements={currentElements}
          />
        </Stage>
      </div>

      {/* Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        currentStep={currentStepIndex}
        totalSteps={currentPlay?.steps.length ?? 0}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        onNextStep={nextStep}
        onPrevStep={prevStep}
      />
    </div>
  )
}
