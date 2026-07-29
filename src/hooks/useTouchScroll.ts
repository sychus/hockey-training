import { useEffect, type RefObject } from 'react'

/**
 * Sets touch-action: pan-y on all <canvas> elements inside a container.
 * This allows vertical scrolling on mobile while Konva handles element drags.
 */
export function useTouchScroll(containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const canvases = container.querySelectorAll('canvas')
    canvases.forEach((canvas) => {
      canvas.style.touchAction = 'pan-y'
    })
  })
}
