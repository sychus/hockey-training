import type { FieldElement } from '../types'

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function interpolateElements(
  fromElements: FieldElement[],
  toElements: FieldElement[],
  t: number,
): FieldElement[] {
  const fromMap = new Map(fromElements.map((el) => [el.id, el]))

  return toElements.map((toEl) => {
    const fromEl = fromMap.get(toEl.id)

    // Si no existía en "from", aparece directamente
    if (!fromEl) return { ...toEl }

    // Interpolar posiciones base
    const interpolated: FieldElement = {
      ...toEl,
      x: lerp(fromEl.x, toEl.x, t),
      y: lerp(fromEl.y, toEl.y, t),
    }

    // Interpolar toX/toY para flechas
    if (toEl.type === 'arrow' && fromEl.type === 'arrow') {
      return {
        ...interpolated,
        toX: lerp(fromEl.toX, toEl.toX, t),
        toY: lerp(fromEl.toY, toEl.toY, t),
      } as FieldElement
    }

    // Interpolar rotación para elementos rotables
    if (
      'rotation' in toEl &&
      'rotation' in fromEl &&
      typeof toEl.rotation === 'number' &&
      typeof fromEl.rotation === 'number'
    ) {
      return {
        ...interpolated,
        rotation: lerp(fromEl.rotation, toEl.rotation, t),
      } as FieldElement
    }

    return interpolated
  })
}
