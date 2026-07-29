import { useState, useRef, useCallback, useEffect } from 'react'
import { interpolateElements } from '../domain/animation'
import type { Step, FieldElement } from '../types'

interface UseAnimationOptions {
  steps: Step[]
  stepDurationMs?: number
}

interface UseAnimationReturn {
  currentElements: FieldElement[]
  isPlaying: boolean
  currentStepIndex: number
  progress: number
  play: () => void
  pause: () => void
  stop: () => void
  goToStep: (index: number) => void
  nextStep: () => void
  prevStep: () => void
}

export function useAnimation({
  steps,
  stepDurationMs = 1000,
}: UseAnimationOptions): UseAnimationReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [interpolationT, setInterpolationT] = useState(0)
  const rafRef = useRef<number>(undefined)
  const startTimeRef = useRef<number>(0)
  const stepIndexRef = useRef(0)

  const totalSteps = steps.length

  // Keep ref in sync
  useEffect(() => {
    stepIndexRef.current = currentStepIndex
  }, [currentStepIndex])

  // Calculate current elements
  const currentElements = (() => {
    if (totalSteps === 0) return []
    const currentStep = steps[currentStepIndex]
    if (!currentStep) return []

    if (interpolationT === 0 || currentStepIndex === 0) {
      return currentStep.elements
    }

    const fromStep = steps[currentStepIndex - 1]
    if (!fromStep) return currentStep.elements

    return interpolateElements(fromStep.elements, currentStep.elements, interpolationT)
  })()

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp

      const elapsed = timestamp - startTimeRef.current
      const t = Math.min(elapsed / stepDurationMs, 1)
      setInterpolationT(t)

      if (t >= 1) {
        // Transition complete
        setInterpolationT(0)
        startTimeRef.current = 0

        const nextIndex = stepIndexRef.current + 1
        if (nextIndex >= totalSteps) {
          setIsPlaying(false)
          return
        }

        setCurrentStepIndex(nextIndex)
        stepIndexRef.current = nextIndex
        rafRef.current = requestAnimationFrame(animate)
      } else {
        rafRef.current = requestAnimationFrame(animate)
      }
    },
    [stepDurationMs, totalSteps],
  )

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0
      rafRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, animate])

  // Reset when steps change
  useEffect(() => {
    setCurrentStepIndex(0)
    stepIndexRef.current = 0
    setInterpolationT(0)
    setIsPlaying(false)
  }, [steps])

  const play = useCallback(() => {
    if (stepIndexRef.current >= totalSteps - 1) {
      setCurrentStepIndex(0)
      stepIndexRef.current = 0
    }
    setIsPlaying(true)
  }, [totalSteps])

  const pause = useCallback(() => {
    setIsPlaying(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const stop = useCallback(() => {
    setIsPlaying(false)
    setCurrentStepIndex(0)
    stepIndexRef.current = 0
    setInterpolationT(0)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalSteps - 1))
      setCurrentStepIndex(clamped)
      stepIndexRef.current = clamped
      setInterpolationT(0)
    },
    [totalSteps],
  )

  const nextStep = useCallback(() => {
    goToStep(stepIndexRef.current + 1)
  }, [goToStep])

  const prevStep = useCallback(() => {
    goToStep(stepIndexRef.current - 1)
  }, [goToStep])

  const progress = totalSteps <= 1 ? 0 : currentStepIndex / (totalSteps - 1)

  return {
    currentElements,
    isPlaying,
    currentStepIndex,
    progress,
    play,
    pause,
    stop,
    goToStep,
    nextStep,
    prevStep,
  }
}
