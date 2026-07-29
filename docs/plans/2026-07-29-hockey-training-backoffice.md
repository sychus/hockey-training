# Plan de Implementación: Hockey Training Session Backoffice

> **Para Claude:** SUB-SKILL REQUERIDO: Usá superpowers:executing-plans para implementar este plan tarea por tarea.

**Objetivo:** Construir un backoffice donde un DT de hockey pueda crear sesiones de entrenamiento con jugadas animadas (keyframes) y compartirlas por link para que los jugadores las vean desde el celular.

**Arquitectura:** SPA en React + Vite desplegada como sitio estático en Netlify. La persistencia usa Netlify Blobs (archivos JSON, sin base de datos). El DT accede al backoffice vía magic link (token largo en la URL, validado contra env var). Los jugadores acceden a un visor público `/s/:sessionId` sin autenticación. La cancha se renderiza con Konva (react-konva) y las animaciones son transiciones entre keyframes/pasos.

**Stack tecnológico:** React 19, Vite, TypeScript, react-konva (Konva), Zustand, TailwindCSS 4, React Router, nanoid, Vitest, Netlify Functions, Netlify Blobs.

---

## Fase 1: Scaffolding del Proyecto

### Tarea 1.1: Inicializar proyecto Vite + React + TypeScript

**Archivos:**
- Crear: proyecto completo via `pnpm create vite`
- Modificar: `package.json`

**Paso 1: Crear proyecto con Vite**

```bash
cd /Users/sychus/develop/hockey-training
pnpm create vite . --template react-ts
```

Esperado: Vite crea la estructura base con React + TypeScript.

**Paso 2: Instalar dependencias core**

```bash
pnpm add react-konva konva react-router zustand nanoid
```

**Paso 3: Instalar dependencias de desarrollo**

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/node
```

**Paso 4: Verificar que compila**

```bash
pnpm dev
```

Esperado: App de Vite corriendo en localhost sin errores.

**Paso 5: Hacer commit**

```bash
git init
git add .
git commit -m "chore: init vite + react + typescript project"
```

---

### Tarea 1.2: Configurar Vitest

**Archivos:**
- Modificar: `vite.config.ts`
- Modificar: `tsconfig.json`
- Crear: `src/__tests__/setup.ts`

**Paso 1: Configurar Vitest en vite.config.ts**

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
  },
})
```

**Paso 2: Crear archivo de setup de tests**

```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom'
```

**Paso 3: Agregar script de test en package.json**

En `package.json`, reemplazar el script `test`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

**Paso 4: Verificar que Vitest funciona**

```bash
pnpm test:run
```

Esperado: Vitest corre (puede que no haya tests aún, pero no debe tirar error de config).

**Paso 5: Hacer commit**

```bash
git add .
git commit -m "chore: configure vitest with jsdom"
```

---

### Tarea 1.3: Configurar TailwindCSS 4

**Archivos:**
- Modificar: `package.json`
- Modificar: `src/index.css`

**Paso 1: Instalar TailwindCSS 4 + plugin Vite**

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

**Paso 2: Agregar plugin en vite.config.ts**

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
  },
})
```

**Paso 3: Configurar el CSS base**

```css
/* src/index.css */
@import "tailwindcss";
```

**Paso 4: Verificar que Tailwind funciona**

Agregar una clase de Tailwind en `App.tsx` y verificar visualmente que se aplica:

```bash
pnpm dev
```

Esperado: Estilos de Tailwind se aplican correctamente.

**Paso 5: Hacer commit**

```bash
git add .
git commit -m "chore: configure tailwindcss 4"
```

---

### Tarea 1.4: Configurar estructura de carpetas y React Router

**Archivos:**
- Crear: `src/types/index.ts` (vacío por ahora)
- Crear: `src/domain/` (vacío)
- Crear: `src/stores/` (vacío)
- Crear: `src/api/` (vacío)
- Crear: `src/components/field/` (vacío)
- Crear: `src/components/editor/` (vacío)
- Crear: `src/components/viewer/` (vacío)
- Crear: `src/components/sessions/` (vacío)
- Crear: `src/components/ui/` (vacío)
- Crear: `src/pages/BackofficePage.tsx`
- Crear: `src/pages/ViewerPage.tsx`
- Crear: `src/pages/NotFoundPage.tsx`
- Modificar: `src/App.tsx`
- Modificar: `src/main.tsx`

**Paso 1: Crear la estructura de carpetas**

```bash
mkdir -p src/{types,domain,stores,api,hooks,lib}
mkdir -p src/components/{field,editor,viewer,sessions,ui}
mkdir -p src/pages
```

**Paso 2: Crear páginas placeholder**

```typescript
// src/pages/BackofficePage.tsx
export function BackofficePage() {
  return <div className="p-8"><h1 className="text-2xl font-bold">Backoffice</h1></div>
}
```

```typescript
// src/pages/ViewerPage.tsx
export function ViewerPage() {
  return <div className="p-8"><h1 className="text-2xl font-bold">Visor de Sesión</h1></div>
}
```

```typescript
// src/pages/NotFoundPage.tsx
export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-600">Página no encontrada</p>
      </div>
    </div>
  )
}
```

**Paso 3: Configurar React Router en App.tsx**

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router'
import { BackofficePage } from './pages/BackofficePage'
import { ViewerPage } from './pages/ViewerPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/backoffice/*" element={<BackofficePage />} />
        <Route path="/s/:sessionId" element={<ViewerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Paso 4: Actualizar main.tsx**

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Paso 5: Verificar rutas**

```bash
pnpm dev
```

Navegar a:
- `http://localhost:5173/backoffice` → muestra "Backoffice"
- `http://localhost:5173/s/test123` → muestra "Visor de Sesión"
- `http://localhost:5173/cualquiercosa` → muestra 404

**Paso 6: Hacer commit**

```bash
git add .
git commit -m "chore: setup project structure and react router"
```

---

### Tarea 1.5: Configurar Netlify

**Archivos:**
- Crear: `netlify.toml`
- Crear: `netlify/functions/.gitkeep`
- Crear: `netlify/edge-functions/.gitkeep`

**Paso 1: Crear netlify.toml**

```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"
  functions = "netlify/functions"

# SPA fallback — todas las rutas van a index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = { Role = [""] }

# API routes van a las functions
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

**Paso 2: Crear directorios de functions**

```bash
mkdir -p netlify/functions netlify/edge-functions
touch netlify/functions/.gitkeep netlify/edge-functions/.gitkeep
```

**Paso 3: Hacer commit**

```bash
git add .
git commit -m "chore: configure netlify deployment"
```

---

## Fase 2: Modelo de Datos y Lógica de Dominio

### Tarea 2.1: Definir tipos del modelo de datos

**Archivos:**
- Crear: `src/types/index.ts`

**Paso 1: Escribir los tipos**

```typescript
// src/types/index.ts

// === Elementos de cancha ===

export interface BaseElement {
  id: string
  x: number  // 0-100 normalizado (% de la cancha)
  y: number  // 0-100 normalizado (% de la cancha)
}

export interface PlayerElement extends BaseElement {
  type: 'player'
  team: 'own' | 'rival'
  label: string  // número o nombre, ej: "7" o "Sofi"
}

export interface BallElement extends BaseElement {
  type: 'ball'
}

export interface ConeElement extends BaseElement {
  type: 'cone'
}

export interface GoalElement extends BaseElement {
  type: 'goal'
  rotation: number  // grados
}

export interface MiniGoalElement extends BaseElement {
  type: 'mini-goal'
  rotation: number
}

export interface HurdleElement extends BaseElement {
  type: 'hurdle'
  rotation: number
}

export interface ArrowElement extends BaseElement {
  type: 'arrow'
  toX: number
  toY: number
  style: 'movement' | 'pass' | 'shot' | 'dribble' | 'optional'
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontSize?: number
}

export type FieldElement =
  | PlayerElement
  | BallElement
  | ConeElement
  | GoalElement
  | MiniGoalElement
  | HurdleElement
  | ArrowElement
  | TextElement

export type ElementType = FieldElement['type']

// === Estructura de sesión ===

export interface Step {
  id: string
  elements: FieldElement[]
}

export interface Play {
  id: string
  title: string
  notes?: string
  steps: Step[]  // ordenados, máx 15
}

export interface Session {
  id: string             // nanoid, se usa en /s/:id
  ownerToken: string     // para futuro multi-DT
  title: string
  description?: string
  plays: Play[]          // ordenadas, máx 10
  createdAt: string      // ISO 8601
  updatedAt: string      // ISO 8601
}
```

**Paso 2: Verificar que compila**

```bash
pnpm exec tsc --noEmit
```

Esperado: Sin errores.

**Paso 3: Hacer commit**

```bash
git add .
git commit -m "feat: define data model types"
```

---

### Tarea 2.2: Crear constantes y configuración

**Archivos:**
- Crear: `src/lib/constants.ts`

**Paso 1: Definir constantes**

```typescript
// src/lib/constants.ts

// === Límites del MVP ===
export const MAX_PLAYS_PER_SESSION = 10
export const MAX_STEPS_PER_PLAY = 15

// === Cancha FIH (metros) ===
export const FIELD = {
  /** Largo real en metros */
  LENGTH_M: 91.4,
  /** Ancho real en metros */
  WIDTH_M: 55,
  /** Aspect ratio (largo / ancho) */
  ASPECT_RATIO: 91.4 / 55,  // ~1.662
} as const

// === Colores ===
export const COLORS = {
  field: '#2d8a4e',         // verde césped
  fieldLines: '#ffffff',     // líneas blancas
  ownTeam: '#f5c542',       // amarillo/dorado
  rivalTeam: '#e74c3c',     // rojo
  ball: '#ffffff',           // blanco
  ballOutline: '#333333',   // contorno oscuro
  cone: '#ff8c00',          // naranja
  goal: '#cccccc',          // gris claro
  hurdle: '#ff6347',        // tomate
  arrowMovement: '#ffffff', // blanco
  arrowPass: '#00bfff',     // celeste
  arrowShot: '#ff4444',     // rojo
  arrowDribble: '#ffd700',  // dorado
  arrowOptional: '#aaaaaa', // gris
} as const

// === Tamaños de elementos (en unidades normalizadas 0-100) ===
export const ELEMENT_SIZES = {
  playerRadius: 2.5,
  ballRadius: 1.2,
  coneSize: 2,
  fontSize: 14,
} as const
```

**Paso 2: Hacer commit**

```bash
git add .
git commit -m "feat: add constants and field configuration"
```

---

### Tarea 2.3: Crear factories para elementos y estructuras

**Archivos:**
- Crear: `src/domain/factories.ts`
- Crear: `src/__tests__/domain/factories.test.ts`

**Paso 1: Escribir tests para las factories**

```typescript
// src/__tests__/domain/factories.test.ts
import { describe, it, expect } from 'vitest'
import {
  createSession,
  createPlay,
  createStep,
  createPlayer,
  createBall,
  createCone,
  createGoal,
  createMiniGoal,
  createHurdle,
  createArrow,
  createText,
} from '../../domain/factories'

describe('factories', () => {
  describe('createSession', () => {
    it('crea una sesión con valores por defecto', () => {
      const session = createSession({ title: 'Entreno Sub-16' })
      expect(session.id).toBeDefined()
      expect(session.id.length).toBeGreaterThan(10)
      expect(session.ownerToken).toBe('')
      expect(session.title).toBe('Entreno Sub-16')
      expect(session.plays).toEqual([])
      expect(session.createdAt).toBeDefined()
      expect(session.updatedAt).toBeDefined()
    })
  })

  describe('createPlay', () => {
    it('crea una jugada con un paso vacío por defecto', () => {
      const play = createPlay({ title: 'Press alta' })
      expect(play.title).toBe('Press alta')
      expect(play.steps).toHaveLength(1)
      expect(play.steps[0].elements).toEqual([])
    })
  })

  describe('createStep', () => {
    it('crea un paso vacío', () => {
      const step = createStep()
      expect(step.id).toBeDefined()
      expect(step.elements).toEqual([])
    })
  })

  describe('createPlayer', () => {
    it('crea un jugador propio', () => {
      const player = createPlayer({ x: 50, y: 30, team: 'own', label: '7' })
      expect(player.type).toBe('player')
      expect(player.team).toBe('own')
      expect(player.label).toBe('7')
      expect(player.x).toBe(50)
      expect(player.y).toBe(30)
    })

    it('crea un jugador rival', () => {
      const player = createPlayer({ x: 20, y: 60, team: 'rival', label: '3' })
      expect(player.team).toBe('rival')
    })
  })

  describe('createBall', () => {
    it('crea una pelota', () => {
      const ball = createBall({ x: 50, y: 50 })
      expect(ball.type).toBe('ball')
    })
  })

  describe('createArrow', () => {
    it('crea una flecha de pase', () => {
      const arrow = createArrow({ x: 10, y: 20, toX: 30, toY: 40, style: 'pass' })
      expect(arrow.type).toBe('arrow')
      expect(arrow.style).toBe('pass')
      expect(arrow.toX).toBe(30)
      expect(arrow.toY).toBe(40)
    })
  })

  describe('createText', () => {
    it('crea un texto', () => {
      const text = createText({ x: 50, y: 10, content: '5v3' })
      expect(text.type).toBe('text')
      expect(text.content).toBe('5v3')
    })
  })
})
```

**Paso 2: Ejecutar tests para confirmar que fallan**

```bash
pnpm test:run src/__tests__/domain/factories.test.ts
```

Esperado: FAIL — módulo `../../domain/factories` no existe.

**Paso 3: Implementar factories**

```typescript
// src/domain/factories.ts
import { nanoid } from 'nanoid'
import type {
  Session,
  Play,
  Step,
  PlayerElement,
  BallElement,
  ConeElement,
  GoalElement,
  MiniGoalElement,
  HurdleElement,
  ArrowElement,
  TextElement,
} from '../types'

export function createSession(data: { title: string; description?: string }): Session {
  const now = new Date().toISOString()
  return {
    id: nanoid(),
    ownerToken: '',
    title: data.title,
    description: data.description,
    plays: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createPlay(data: { title: string; notes?: string }): Play {
  return {
    id: nanoid(),
    title: data.title,
    notes: data.notes,
    steps: [createStep()],
  }
}

export function createStep(): Step {
  return {
    id: nanoid(),
    elements: [],
  }
}

export function createPlayer(data: {
  x: number
  y: number
  team: 'own' | 'rival'
  label: string
}): PlayerElement {
  return { id: nanoid(), type: 'player', ...data }
}

export function createBall(data: { x: number; y: number }): BallElement {
  return { id: nanoid(), type: 'ball', ...data }
}

export function createCone(data: { x: number; y: number }): ConeElement {
  return { id: nanoid(), type: 'cone', ...data }
}

export function createGoal(data: { x: number; y: number; rotation?: number }): GoalElement {
  return { id: nanoid(), type: 'goal', rotation: 0, ...data }
}

export function createMiniGoal(data: { x: number; y: number; rotation?: number }): MiniGoalElement {
  return { id: nanoid(), type: 'mini-goal', rotation: 0, ...data }
}

export function createHurdle(data: { x: number; y: number; rotation?: number }): HurdleElement {
  return { id: nanoid(), type: 'hurdle', rotation: 0, ...data }
}

export function createArrow(data: {
  x: number
  y: number
  toX: number
  toY: number
  style: ArrowElement['style']
}): ArrowElement {
  return { id: nanoid(), type: 'arrow', ...data }
}

export function createText(data: {
  x: number
  y: number
  content: string
  fontSize?: number
}): TextElement {
  return { id: nanoid(), type: 'text', ...data }
}
```

**Paso 4: Ejecutar tests para confirmar que pasan**

```bash
pnpm test:run src/__tests__/domain/factories.test.ts
```

Esperado: PASS — todos los tests pasan.

**Paso 5: Hacer commit**

```bash
git add .
git commit -m "feat: add factory functions for domain entities"
```

---

### Tarea 2.4: Crear validaciones de dominio

**Archivos:**
- Crear: `src/domain/validation.ts`
- Crear: `src/__tests__/domain/validation.test.ts`

**Paso 1: Escribir tests de validación**

```typescript
// src/__tests__/domain/validation.test.ts
import { describe, it, expect } from 'vitest'
import { canAddPlay, canAddStep, getRemainingPlays, getRemainingSteps } from '../../domain/validation'
import { createSession, createPlay, createStep } from '../../domain/factories'
import { MAX_PLAYS_PER_SESSION, MAX_STEPS_PER_PLAY } from '../../lib/constants'

describe('validation', () => {
  describe('canAddPlay', () => {
    it('permite agregar jugada cuando hay espacio', () => {
      const session = createSession({ title: 'Test' })
      expect(canAddPlay(session)).toBe(true)
    })

    it('no permite agregar jugada cuando se alcanzó el límite', () => {
      const session = createSession({ title: 'Test' })
      session.plays = Array.from({ length: MAX_PLAYS_PER_SESSION }, (_, i) =>
        createPlay({ title: `Jugada ${i + 1}` })
      )
      expect(canAddPlay(session)).toBe(false)
    })
  })

  describe('canAddStep', () => {
    it('permite agregar paso cuando hay espacio', () => {
      const play = createPlay({ title: 'Test' })
      expect(canAddStep(play)).toBe(true)
    })

    it('no permite agregar paso cuando se alcanzó el límite', () => {
      const play = createPlay({ title: 'Test' })
      play.steps = Array.from({ length: MAX_STEPS_PER_PLAY }, () => createStep())
      expect(canAddStep(play)).toBe(false)
    })
  })

  describe('getRemainingPlays', () => {
    it('devuelve la cantidad restante', () => {
      const session = createSession({ title: 'Test' })
      session.plays = [createPlay({ title: 'J1' }), createPlay({ title: 'J2' })]
      expect(getRemainingPlays(session)).toBe(MAX_PLAYS_PER_SESSION - 2)
    })
  })

  describe('getRemainingSteps', () => {
    it('devuelve la cantidad restante', () => {
      const play = createPlay({ title: 'Test' })
      // createPlay ya crea 1 paso
      expect(getRemainingSteps(play)).toBe(MAX_STEPS_PER_PLAY - 1)
    })
  })
})
```

**Paso 2: Ejecutar tests para confirmar que fallan**

```bash
pnpm test:run src/__tests__/domain/validation.test.ts
```

Esperado: FAIL.

**Paso 3: Implementar validaciones**

```typescript
// src/domain/validation.ts
import type { Session, Play } from '../types'
import { MAX_PLAYS_PER_SESSION, MAX_STEPS_PER_PLAY } from '../lib/constants'

export function canAddPlay(session: Session): boolean {
  return session.plays.length < MAX_PLAYS_PER_SESSION
}

export function canAddStep(play: Play): boolean {
  return play.steps.length < MAX_STEPS_PER_PLAY
}

export function getRemainingPlays(session: Session): number {
  return MAX_PLAYS_PER_SESSION - session.plays.length
}

export function getRemainingSteps(play: Play): number {
  return MAX_STEPS_PER_PLAY - play.steps.length
}
```

**Paso 4: Ejecutar tests para confirmar que pasan**

```bash
pnpm test:run src/__tests__/domain/validation.test.ts
```

Esperado: PASS.

**Paso 5: Hacer commit**

```bash
git add .
git commit -m "feat: add domain validation functions with limits"
```

---

## Fase 3: Renderizado de la Cancha

### Tarea 3.1: Componente de cancha FIH

**Archivos:**
- Crear: `src/components/field/HockeyField.tsx`
- Crear: `src/components/field/field-dimensions.ts`

**Paso 1: Definir dimensiones de cancha FIH**

```typescript
// src/components/field/field-dimensions.ts

/**
 * Dimensiones reglamentarias FIH para hockey sobre césped.
 * Todas las medidas en metros, luego se normalizan al canvas.
 *
 * La cancha se renderiza en orientación VERTICAL (largo = eje Y).
 * Coordenadas normalizadas: x = 0-100 (ancho), y = 0-100 (largo).
 *
 * Referencia: FIH Rules of Hockey, Appendix A — Field Dimensions.
 */

// Medidas reales FIH en metros
const LENGTH = 91.4
const WIDTH = 55

// Función helper: convierte metros a % normalizado
const xPct = (meters: number) => (meters / WIDTH) * 100
const yPct = (meters: number) => (meters / LENGTH) * 100

export const FIELD_LINES = {
  // Línea central
  centerLine: { y: 50 },

  // Círculos de 23 metros (líneas de 25 yardas)
  line23m: {
    fromGoalLine: yPct(22.9),  // 22.9m desde cada línea de fondo
  },

  // Círculo de tiro (shooting circle / D)
  // Arco de 14.63m de radio centrado en el arco
  shootingCircle: {
    radius: xPct(14.63),
    // Línea recta de 3.66m centrada en el arco
    straightLineWidth: xPct(3.66),
  },

  // Punto de penal
  penaltySpot: {
    fromGoalLine: yPct(6.4),  // 6.4m desde línea de fondo
  },

  // Arcos
  goal: {
    width: xPct(3.66),   // 3.66m de ancho
    depth: xPct(1.22),   // 1.22m de profundidad (no se dibuja en la cancha 2D)
  },
} as const
```

**Paso 2: Crear componente de cancha**

```typescript
// src/components/field/HockeyField.tsx
import { Rect, Line, Circle, Arc, Group } from 'react-konva'
import { FIELD_LINES } from './field-dimensions'
import { COLORS } from '../../lib/constants'

interface HockeyFieldProps {
  width: number
  height: number
}

export function HockeyField({ width, height }: HockeyFieldProps) {
  // Convertir % normalizado a pixels
  const px = (pct: number, axis: 'x' | 'y') =>
    axis === 'x' ? (pct / 100) * width : (pct / 100) * height

  const lineColor = COLORS.fieldLines
  const lineWidth = 2

  return (
    <Group>
      {/* Fondo verde */}
      <Rect x={0} y={0} width={width} height={height} fill={COLORS.field} />

      {/* Borde de la cancha */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Línea central */}
      <Line
        points={[0, height / 2, width, height / 2]}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Línea de 23m — arriba */}
      <Line
        points={[
          0,
          px(FIELD_LINES.line23m.fromGoalLine, 'y'),
          width,
          px(FIELD_LINES.line23m.fromGoalLine, 'y'),
        ]}
        stroke={lineColor}
        strokeWidth={lineWidth}
        dash={[10, 5]}
      />

      {/* Línea de 23m — abajo */}
      <Line
        points={[
          0,
          height - px(FIELD_LINES.line23m.fromGoalLine, 'y'),
          width,
          height - px(FIELD_LINES.line23m.fromGoalLine, 'y'),
        ]}
        stroke={lineColor}
        strokeWidth={lineWidth}
        dash={[10, 5]}
      />

      {/* Shooting circle (D) — arriba */}
      <ShootingCircle
        width={width}
        height={height}
        position="top"
        lineColor={lineColor}
        lineWidth={lineWidth}
      />

      {/* Shooting circle (D) — abajo */}
      <ShootingCircle
        width={width}
        height={height}
        position="bottom"
        lineColor={lineColor}
        lineWidth={lineWidth}
      />

      {/* Punto de penal — arriba */}
      <Circle
        x={width / 2}
        y={px(FIELD_LINES.penaltySpot.fromGoalLine, 'y')}
        radius={3}
        fill={lineColor}
      />

      {/* Punto de penal — abajo */}
      <Circle
        x={width / 2}
        y={height - px(FIELD_LINES.penaltySpot.fromGoalLine, 'y')}
        radius={3}
        fill={lineColor}
      />

      {/* Arco — arriba */}
      <GoalLine
        width={width}
        canvasWidth={width}
        position="top"
        lineColor={lineColor}
        lineWidth={lineWidth + 1}
      />

      {/* Arco — abajo */}
      <GoalLine
        width={width}
        canvasWidth={width}
        position="bottom"
        lineColor={lineColor}
        lineWidth={lineWidth + 1}
      />
    </Group>
  )
}

// === Sub-componentes internos ===

function ShootingCircle({
  width,
  height,
  position,
  lineColor,
  lineWidth,
}: {
  width: number
  height: number
  position: 'top' | 'bottom'
  lineColor: string
  lineWidth: number
}) {
  const radiusPx = (FIELD_LINES.shootingCircle.radius / 100) * width
  const straightHalf = (FIELD_LINES.shootingCircle.straightLineWidth / 100) * width / 2
  const centerX = width / 2
  const centerY = position === 'top' ? 0 : height

  // El "D" es un arco de 14.63m de radio + una línea recta de 3.66m
  // Simplificación: dibujamos un arco semicircular
  return (
    <Arc
      x={centerX}
      y={centerY}
      innerRadius={0}
      outerRadius={radiusPx}
      angle={180}
      rotation={position === 'top' ? 0 : 180}
      stroke={lineColor}
      strokeWidth={lineWidth}
      fill="transparent"
    />
  )
}

function GoalLine({
  width,
  canvasWidth,
  position,
  lineColor,
  lineWidth,
}: {
  width: number
  canvasWidth: number
  position: 'top' | 'bottom'
  lineColor: string
  lineWidth: number
}) {
  const goalWidthPx = (FIELD_LINES.goal.width / 100) * canvasWidth
  const centerX = canvasWidth / 2
  const y = position === 'top' ? 0 : 0 // Se dibuja sobre la línea de fondo

  return (
    <Line
      points={[
        centerX - goalWidthPx / 2,
        position === 'top' ? 0 : 0,
        centerX + goalWidthPx / 2,
        position === 'top' ? 0 : 0,
      ]}
      stroke={lineColor}
      strokeWidth={lineWidth + 2}
      y={position === 'top' ? 0 : 0}
    />
  )
}
```

> **NOTA:** El componente `ShootingCircle` es una simplificación inicial. El "D" real de hockey no es un semicírculo perfecto — es un arco de 14.63m con una línea recta de 3.66m en el centro. Se refinará en la fase de Polish si es necesario.

**Paso 3: Crear un componente de prueba visual para verificar**

Modificar temporalmente `BackofficePage.tsx` para renderizar la cancha:

```typescript
// src/pages/BackofficePage.tsx
import { Stage, Layer } from 'react-konva'
import { HockeyField } from '../components/field/HockeyField'

export function BackofficePage() {
  const fieldWidth = 400
  const fieldHeight = Math.round(fieldWidth * (91.4 / 55)) // aspect ratio FIH

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Backoffice</h1>
      <Stage width={fieldWidth} height={fieldHeight}>
        <Layer>
          <HockeyField width={fieldWidth} height={fieldHeight} />
        </Layer>
      </Stage>
    </div>
  )
}
```

**Paso 4: Verificar visualmente**

```bash
pnpm dev
```

Navegar a `/backoffice`. Esperado: cancha verde con líneas blancas, proporciones FIH.

**Paso 5: Hacer commit**

```bash
git add .
git commit -m "feat: add FIH hockey field canvas component"
```

---

### Tarea 3.2: Componentes de elementos de cancha

**Archivos:**
- Crear: `src/components/field/elements/PlayerToken.tsx`
- Crear: `src/components/field/elements/BallToken.tsx`
- Crear: `src/components/field/elements/ConeToken.tsx`
- Crear: `src/components/field/elements/GoalToken.tsx`
- Crear: `src/components/field/elements/HurdleToken.tsx`
- Crear: `src/components/field/elements/ArrowLine.tsx`
- Crear: `src/components/field/elements/TextNote.tsx`
- Crear: `src/components/field/elements/index.ts`

**Paso 1: Crear PlayerToken**

```typescript
// src/components/field/elements/PlayerToken.tsx
import { Circle, Text, Group } from 'react-konva'
import { COLORS, ELEMENT_SIZES } from '../../../lib/constants'
import type { PlayerElement } from '../../../types'

interface PlayerTokenProps {
  element: PlayerElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function PlayerToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: PlayerTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const radius = (ELEMENT_SIZES.playerRadius / 100) * fieldWidth
  const color = element.team === 'own' ? COLORS.ownTeam : COLORS.rivalTeam

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
      <Circle radius={radius} fill={color} stroke="#000" strokeWidth={1} />
      <Text
        text={element.label}
        fontSize={radius * 0.9}
        fill="#000"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        offsetX={radius * 0.5}
        offsetY={radius * 0.4}
        width={radius * 1}
      />
    </Group>
  )
}
```

**Paso 2: Crear BallToken**

```typescript
// src/components/field/elements/BallToken.tsx
import { Circle, Group } from 'react-konva'
import { COLORS, ELEMENT_SIZES } from '../../../lib/constants'
import type { BallElement } from '../../../types'

interface BallTokenProps {
  element: BallElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function BallToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: BallTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const radius = (ELEMENT_SIZES.ballRadius / 100) * fieldWidth

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
      <Circle radius={radius} fill={COLORS.ball} stroke={COLORS.ballOutline} strokeWidth={1.5} />
    </Group>
  )
}
```

**Paso 3: Crear ConeToken**

```typescript
// src/components/field/elements/ConeToken.tsx
import { RegularPolygon, Group } from 'react-konva'
import { COLORS, ELEMENT_SIZES } from '../../../lib/constants'
import type { ConeElement } from '../../../types'

interface ConeTokenProps {
  element: ConeElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function ConeToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: ConeTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const size = (ELEMENT_SIZES.coneSize / 100) * fieldWidth

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
      <RegularPolygon
        sides={3}
        radius={size}
        fill={COLORS.cone}
        stroke="#000"
        strokeWidth={1}
      />
    </Group>
  )
}
```

**Paso 4: Crear ArrowLine**

```typescript
// src/components/field/elements/ArrowLine.tsx
import { Arrow, Group } from 'react-konva'
import { COLORS } from '../../../lib/constants'
import type { ArrowElement } from '../../../types'

interface ArrowLineProps {
  element: ArrowElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

const ARROW_STYLE_CONFIG: Record<
  ArrowElement['style'],
  { color: string; dash?: number[] }
> = {
  movement: { color: COLORS.arrowMovement },
  pass: { color: COLORS.arrowPass, dash: [10, 5] },
  shot: { color: COLORS.arrowShot, dash: [3, 3] },
  dribble: { color: COLORS.arrowDribble, dash: [8, 4, 2, 4] },
  optional: { color: COLORS.arrowOptional, dash: [5, 5] },
}

export function ArrowLine({
  element,
  fieldWidth,
  fieldHeight,
  onSelect,
}: ArrowLineProps) {
  const fromX = (element.x / 100) * fieldWidth
  const fromY = (element.y / 100) * fieldHeight
  const toX = (element.toX / 100) * fieldWidth
  const toY = (element.toY / 100) * fieldHeight

  const config = ARROW_STYLE_CONFIG[element.style]

  return (
    <Arrow
      points={[fromX, fromY, toX, toY]}
      stroke={config.color}
      strokeWidth={2}
      fill={config.color}
      pointerLength={8}
      pointerWidth={6}
      dash={config.dash}
      onClick={() => onSelect?.(element.id)}
      onTap={() => onSelect?.(element.id)}
    />
  )
}
```

**Paso 5: Crear TextNote**

```typescript
// src/components/field/elements/TextNote.tsx
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
```

**Paso 6: Crear GoalToken y HurdleToken**

```typescript
// src/components/field/elements/GoalToken.tsx
import { Rect, Group } from 'react-konva'
import { COLORS } from '../../../lib/constants'
import type { GoalElement } from '../../../types'

interface GoalTokenProps {
  element: GoalElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function GoalToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: GoalTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const goalW = fieldWidth * 0.08
  const goalH = fieldWidth * 0.03

  return (
    <Group
      x={x}
      y={y}
      rotation={element.rotation}
      draggable={draggable}
      onDragEnd={(e) => {
        const newX = (e.target.x() / fieldWidth) * 100
        const newY = (e.target.y() / fieldHeight) * 100
        onDragEnd?.(element.id, newX, newY)
      }}
      onClick={() => onSelect?.(element.id)}
      onTap={() => onSelect?.(element.id)}
    >
      <Rect
        offsetX={goalW / 2}
        offsetY={goalH / 2}
        width={goalW}
        height={goalH}
        fill="transparent"
        stroke={COLORS.goal}
        strokeWidth={2}
      />
    </Group>
  )
}
```

```typescript
// src/components/field/elements/HurdleToken.tsx
import { Rect, Group } from 'react-konva'
import { COLORS } from '../../../lib/constants'
import type { HurdleElement } from '../../../types'

interface HurdleTokenProps {
  element: HurdleElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function HurdleToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: HurdleTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const w = fieldWidth * 0.06
  const h = fieldWidth * 0.015

  return (
    <Group
      x={x}
      y={y}
      rotation={element.rotation}
      draggable={draggable}
      onDragEnd={(e) => {
        const newX = (e.target.x() / fieldWidth) * 100
        const newY = (e.target.y() / fieldHeight) * 100
        onDragEnd?.(element.id, newX, newY)
      }}
      onClick={() => onSelect?.(element.id)}
      onTap={() => onSelect?.(element.id)}
    >
      <Rect
        offsetX={w / 2}
        offsetY={h / 2}
        width={w}
        height={h}
        fill={COLORS.hurdle}
        stroke="#000"
        strokeWidth={1}
      />
    </Group>
  )
}
```

**Paso 7: Crear barrel export**

```typescript
// src/components/field/elements/index.ts
export { PlayerToken } from './PlayerToken'
export { BallToken } from './BallToken'
export { ConeToken } from './ConeToken'
export { GoalToken } from './GoalToken'
export { HurdleToken } from './HurdleToken'
export { ArrowLine } from './ArrowLine'
export { TextNote } from './TextNote'
```

**Paso 8: Verificar que compila**

```bash
pnpm exec tsc --noEmit
```

Esperado: Sin errores.

**Paso 9: Hacer commit**

```bash
git add .
git commit -m "feat: add field element rendering components"
```

---

### Tarea 3.3: Componente FieldRenderer que orquesta todos los elementos

**Archivos:**
- Crear: `src/components/field/FieldRenderer.tsx`

**Paso 1: Implementar el renderer**

```typescript
// src/components/field/FieldRenderer.tsx
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
  onElementDragEnd?: (id: string, x: number, y: number) => void
  onElementSelect?: (id: string) => void
}

export function FieldRenderer({
  width,
  height,
  elements,
  draggable = false,
  onElementDragEnd,
  onElementSelect,
}: FieldRendererProps) {
  const commonProps = {
    fieldWidth: width,
    fieldHeight: height,
    draggable,
    onDragEnd: onElementDragEnd,
    onSelect: onElementSelect,
  }

  const renderElement = (element: FieldElement) => {
    switch (element.type) {
      case 'player':
        return <PlayerToken key={element.id} element={element} {...commonProps} />
      case 'ball':
        return <BallToken key={element.id} element={element} {...commonProps} />
      case 'cone':
        return <ConeToken key={element.id} element={element} {...commonProps} />
      case 'goal':
        return <GoalToken key={element.id} element={element} {...commonProps} />
      case 'mini-goal':
        return <GoalToken key={element.id} element={element as any} {...commonProps} />
      case 'hurdle':
        return <HurdleToken key={element.id} element={element} {...commonProps} />
      case 'arrow':
        return <ArrowLine key={element.id} element={element} {...commonProps} />
      case 'text':
        return <TextNote key={element.id} element={element} {...commonProps} />
    }
  }

  // Renderizar flechas primero (debajo de todo), luego el resto
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
```

**Paso 2: Verificar con datos de prueba en BackofficePage**

Actualizar temporalmente `BackofficePage.tsx` para verificar visualmente:

```typescript
// src/pages/BackofficePage.tsx
import { Stage } from 'react-konva'
import { FieldRenderer } from '../components/field/FieldRenderer'
import { createPlayer, createBall, createCone, createArrow } from '../domain/factories'
import { FIELD } from '../lib/constants'

const testElements = [
  createPlayer({ x: 30, y: 40, team: 'own', label: '7' }),
  createPlayer({ x: 50, y: 50, team: 'own', label: '11' }),
  createPlayer({ x: 60, y: 35, team: 'rival', label: '3' }),
  createBall({ x: 45, y: 45 }),
  createCone({ x: 25, y: 60 }),
  createCone({ x: 35, y: 60 }),
  createCone({ x: 45, y: 60 }),
  createArrow({ x: 30, y: 40, toX: 50, toY: 50, style: 'pass' }),
  createArrow({ x: 50, y: 50, toX: 60, toY: 30, style: 'movement' }),
]

export function BackofficePage() {
  const fieldWidth = 400
  const fieldHeight = Math.round(fieldWidth * FIELD.ASPECT_RATIO)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Backoffice — Test Visual</h1>
      <Stage width={fieldWidth} height={fieldHeight}>
        <FieldRenderer
          width={fieldWidth}
          height={fieldHeight}
          elements={testElements}
        />
      </Stage>
    </div>
  )
}
```

**Paso 3: Verificar visualmente**

```bash
pnpm dev
```

Navegar a `/backoffice`. Esperado: cancha verde con jugadores amarillos y rojos, pelota, conos naranjas, y flechas.

**Paso 4: Hacer commit**

```bash
git add .
git commit -m "feat: add FieldRenderer orchestrator component"
```

---

## Fase 4: State Management (Zustand)

### Tarea 4.1: Store del editor

**Archivos:**
- Crear: `src/stores/editor-store.ts`
- Crear: `src/__tests__/stores/editor-store.test.ts`

**Paso 1: Escribir tests para el store**

```typescript
// src/__tests__/stores/editor-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../../stores/editor-store'
import { createPlayer, createBall } from '../../domain/factories'

describe('editorStore', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  describe('plays', () => {
    it('agrega una jugada', () => {
      useEditorStore.getState().addPlay('Press alta')
      const state = useEditorStore.getState()
      expect(state.session.plays).toHaveLength(1)
      expect(state.session.plays[0].title).toBe('Press alta')
      expect(state.session.plays[0].steps).toHaveLength(1)
    })

    it('no agrega más de 10 jugadas', () => {
      const store = useEditorStore.getState()
      for (let i = 0; i < 12; i++) {
        store.addPlay(`Jugada ${i + 1}`)
      }
      expect(useEditorStore.getState().session.plays).toHaveLength(10)
    })

    it('elimina una jugada', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.addPlay('Jugada 2')
      const playId = useEditorStore.getState().session.plays[0].id
      store.removePlay(playId)
      expect(useEditorStore.getState().session.plays).toHaveLength(1)
      expect(useEditorStore.getState().session.plays[0].title).toBe('Jugada 2')
    })

    it('reordena jugadas', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.addPlay('Jugada 2')
      store.addPlay('Jugada 3')
      store.reorderPlays(2, 0)
      const titles = useEditorStore.getState().session.plays.map((p) => p.title)
      expect(titles).toEqual(['Jugada 3', 'Jugada 1', 'Jugada 2'])
    })
  })

  describe('steps', () => {
    it('agrega un paso a la jugada activa', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.addStep()
      const play = useEditorStore.getState().session.plays[0]
      expect(play.steps).toHaveLength(2)
    })

    it('no agrega más de 15 pasos', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      for (let i = 0; i < 20; i++) {
        store.addStep()
      }
      expect(useEditorStore.getState().session.plays[0].steps).toHaveLength(15)
    })

    it('elimina un paso', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.addStep()
      const stepId = useEditorStore.getState().session.plays[0].steps[1].id
      store.removeStep(stepId)
      expect(useEditorStore.getState().session.plays[0].steps).toHaveLength(1)
    })
  })

  describe('elements', () => {
    it('agrega un elemento al paso activo', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.setActiveStep(0)
      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      const step = useEditorStore.getState().session.plays[0].steps[0]
      expect(step.elements).toHaveLength(1)
      expect(step.elements[0].type).toBe('player')
    })

    it('mueve un elemento (actualiza x, y)', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.setActiveStep(0)
      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      store.moveElement(player.id, 70, 30)
      const step = useEditorStore.getState().session.plays[0].steps[0]
      expect(step.elements[0].x).toBe(70)
      expect(step.elements[0].y).toBe(30)
    })

    it('elimina un elemento', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.setActiveStep(0)
      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      store.removeElement(player.id)
      const step = useEditorStore.getState().session.plays[0].steps[0]
      expect(step.elements).toHaveLength(0)
    })
  })

  describe('navigation', () => {
    it('navega entre jugadas', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.addPlay('Jugada 2')
      store.setActivePlay(1)
      expect(useEditorStore.getState().activePlayIndex).toBe(1)
    })

    it('navega entre pasos', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.addStep()
      store.setActiveStep(1)
      expect(useEditorStore.getState().activeStepIndex).toBe(1)
    })
  })
})
```

**Paso 2: Ejecutar tests para confirmar que fallan**

```bash
pnpm test:run src/__tests__/stores/editor-store.test.ts
```

Esperado: FAIL.

**Paso 3: Implementar el store**

```typescript
// src/stores/editor-store.ts
import { create } from 'zustand'
import type { Session, Play, FieldElement } from '../types'
import { createSession, createPlay, createStep } from '../domain/factories'
import { canAddPlay, canAddStep } from '../domain/validation'

interface EditorState {
  session: Session
  activePlayIndex: number
  activeStepIndex: number
  selectedElementId: string | null

  // Session
  setSession: (session: Session) => void
  updateSessionTitle: (title: string) => void
  updateSessionDescription: (description: string) => void

  // Plays
  addPlay: (title: string) => void
  removePlay: (playId: string) => void
  reorderPlays: (fromIndex: number, toIndex: number) => void
  updatePlayTitle: (playId: string, title: string) => void
  updatePlayNotes: (playId: string, notes: string) => void

  // Steps
  addStep: () => void
  removeStep: (stepId: string) => void
  duplicateStep: (stepIndex: number) => void

  // Elements
  addElement: (element: FieldElement) => void
  moveElement: (elementId: string, x: number, y: number) => void
  removeElement: (elementId: string) => void
  updateElement: (elementId: string, updates: Partial<FieldElement>) => void

  // Navigation
  setActivePlay: (index: number) => void
  setActiveStep: (index: number) => void
  selectElement: (id: string | null) => void

  // Reset
  reset: () => void
}

const initialSession = createSession({ title: 'Nueva Sesión' })

export const useEditorStore = create<EditorState>((set, get) => ({
  session: initialSession,
  activePlayIndex: -1,
  activeStepIndex: -1,
  selectedElementId: null,

  setSession: (session) => set({ session, activePlayIndex: -1, activeStepIndex: -1, selectedElementId: null }),

  updateSessionTitle: (title) =>
    set((state) => ({
      session: { ...state.session, title, updatedAt: new Date().toISOString() },
    })),

  updateSessionDescription: (description) =>
    set((state) => ({
      session: { ...state.session, description, updatedAt: new Date().toISOString() },
    })),

  // === Plays ===
  addPlay: (title) =>
    set((state) => {
      if (!canAddPlay(state.session)) return state
      const play = createPlay({ title })
      return {
        session: {
          ...state.session,
          plays: [...state.session.plays, play],
          updatedAt: new Date().toISOString(),
        },
      }
    }),

  removePlay: (playId) =>
    set((state) => {
      const plays = state.session.plays.filter((p) => p.id !== playId)
      const newActivePlayIndex =
        state.activePlayIndex >= plays.length ? plays.length - 1 : state.activePlayIndex
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
        activePlayIndex: newActivePlayIndex,
        activeStepIndex: -1,
        selectedElementId: null,
      }
    }),

  reorderPlays: (fromIndex, toIndex) =>
    set((state) => {
      const plays = [...state.session.plays]
      const [moved] = plays.splice(fromIndex, 1)
      plays.splice(toIndex, 0, moved)
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  updatePlayTitle: (playId, title) =>
    set((state) => ({
      session: {
        ...state.session,
        plays: state.session.plays.map((p) => (p.id === playId ? { ...p, title } : p)),
        updatedAt: new Date().toISOString(),
      },
    })),

  updatePlayNotes: (playId, notes) =>
    set((state) => ({
      session: {
        ...state.session,
        plays: state.session.plays.map((p) => (p.id === playId ? { ...p, notes } : p)),
        updatedAt: new Date().toISOString(),
      },
    })),

  // === Steps ===
  addStep: () =>
    set((state) => {
      const { activePlayIndex } = state
      if (activePlayIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      if (!canAddStep(play)) return state
      const step = createStep()
      const updatedPlay = { ...play, steps: [...play.steps, step] }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  removeStep: (stepId) =>
    set((state) => {
      const { activePlayIndex } = state
      if (activePlayIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      if (play.steps.length <= 1) return state // no dejar sin pasos
      const steps = play.steps.filter((s) => s.id !== stepId)
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      const newActiveStepIndex =
        state.activeStepIndex >= steps.length ? steps.length - 1 : state.activeStepIndex
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
        activeStepIndex: newActiveStepIndex,
        selectedElementId: null,
      }
    }),

  duplicateStep: (stepIndex) =>
    set((state) => {
      const { activePlayIndex } = state
      if (activePlayIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      if (!canAddStep(play)) return state
      const sourceStep = play.steps[stepIndex]
      if (!sourceStep) return state
      const newStep = {
        ...createStep(),
        elements: sourceStep.elements.map((el) => ({ ...el })),
      }
      const steps = [...play.steps]
      steps.splice(stepIndex + 1, 0, newStep)
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
        activeStepIndex: stepIndex + 1,
      }
    }),

  // === Elements ===
  addElement: (element) =>
    set((state) => {
      const { activePlayIndex, activeStepIndex } = state
      if (activePlayIndex < 0 || activeStepIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      const step = play.steps[activeStepIndex]
      const updatedStep = { ...step, elements: [...step.elements, element] }
      const steps = play.steps.map((s, i) => (i === activeStepIndex ? updatedStep : s))
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  moveElement: (elementId, x, y) =>
    set((state) => {
      const { activePlayIndex, activeStepIndex } = state
      if (activePlayIndex < 0 || activeStepIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      const step = play.steps[activeStepIndex]
      const elements = step.elements.map((el) =>
        el.id === elementId ? { ...el, x, y } : el,
      )
      const updatedStep = { ...step, elements }
      const steps = play.steps.map((s, i) => (i === activeStepIndex ? updatedStep : s))
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  removeElement: (elementId) =>
    set((state) => {
      const { activePlayIndex, activeStepIndex } = state
      if (activePlayIndex < 0 || activeStepIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      const step = play.steps[activeStepIndex]
      const elements = step.elements.filter((el) => el.id !== elementId)
      const updatedStep = { ...step, elements }
      const steps = play.steps.map((s, i) => (i === activeStepIndex ? updatedStep : s))
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
        selectedElementId:
          state.selectedElementId === elementId ? null : state.selectedElementId,
      }
    }),

  updateElement: (elementId, updates) =>
    set((state) => {
      const { activePlayIndex, activeStepIndex } = state
      if (activePlayIndex < 0 || activeStepIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      const step = play.steps[activeStepIndex]
      const elements = step.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el,
      )
      const updatedStep = { ...step, elements }
      const steps = play.steps.map((s, i) => (i === activeStepIndex ? updatedStep : s))
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  // === Navigation ===
  setActivePlay: (index) =>
    set({ activePlayIndex: index, activeStepIndex: index >= 0 ? 0 : -1, selectedElementId: null }),

  setActiveStep: (index) =>
    set({ activeStepIndex: index, selectedElementId: null }),

  selectElement: (id) => set({ selectedElementId: id }),

  // === Reset ===
  reset: () =>
    set({
      session: createSession({ title: 'Nueva Sesión' }),
      activePlayIndex: -1,
      activeStepIndex: -1,
      selectedElementId: null,
    }),
}))
```

**Paso 4: Ejecutar tests para confirmar que pasan**

```bash
pnpm test:run src/__tests__/stores/editor-store.test.ts
```

Esperado: PASS.

**Paso 5: Hacer commit**

```bash
git add .
git commit -m "feat: add editor zustand store with plays, steps, and elements"
```

---

## Fase 5: Editor — UI

### Tarea 5.1: Layout del editor

**Archivos:**
- Crear: `src/components/editor/EditorLayout.tsx`
- Crear: `src/components/editor/PlayListPanel.tsx`
- Crear: `src/components/editor/StepNavigator.tsx`
- Crear: `src/components/editor/ElementToolbar.tsx`
- Crear: `src/components/ui/LimitIndicator.tsx`

**Paso 1: Crear LimitIndicator**

```typescript
// src/components/ui/LimitIndicator.tsx
interface LimitIndicatorProps {
  current: number
  max: number
  label: string
}

export function LimitIndicator({ current, max, label }: LimitIndicatorProps) {
  const isAtLimit = current >= max
  const isNearLimit = current >= max - 2

  return (
    <span
      className={`text-sm font-mono ${
        isAtLimit
          ? 'text-red-500 font-bold'
          : isNearLimit
            ? 'text-yellow-500'
            : 'text-gray-400'
      }`}
    >
      {label}: {current}/{max}
    </span>
  )
}
```

**Paso 2: Crear ElementToolbar**

```typescript
// src/components/editor/ElementToolbar.tsx
import { useEditorStore } from '../../stores/editor-store'
import {
  createPlayer,
  createBall,
  createCone,
  createGoal,
  createMiniGoal,
  createHurdle,
  createArrow,
  createText,
} from '../../domain/factories'

const TOOLS = [
  { label: 'Jugador propio', icon: '🟡', action: () => createPlayer({ x: 50, y: 50, team: 'own', label: '?' }) },
  { label: 'Jugador rival', icon: '🔴', action: () => createPlayer({ x: 50, y: 50, team: 'rival', label: '?' }) },
  { label: 'Pelota', icon: '⚪', action: () => createBall({ x: 50, y: 50 }) },
  { label: 'Cono', icon: '🔶', action: () => createCone({ x: 50, y: 50 }) },
  { label: 'Arco', icon: '🥅', action: () => createGoal({ x: 50, y: 10 }) },
  { label: 'Mini arco', icon: '▬', action: () => createMiniGoal({ x: 50, y: 50 }) },
  { label: 'Valla', icon: '━', action: () => createHurdle({ x: 50, y: 50 }) },
  { label: 'Movimiento', icon: '→', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'movement' }) },
  { label: 'Pase', icon: '⇢', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'pass' }) },
  { label: 'Tiro', icon: '⟶', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'shot' }) },
  { label: 'Conducción', icon: '〰', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'dribble' }) },
  { label: 'Opcional', icon: '⇝', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'optional' }) },
  { label: 'Texto', icon: 'T', action: () => createText({ x: 50, y: 50, content: 'Nota' }) },
] as const

export function ElementToolbar() {
  const addElement = useEditorStore((s) => s.addElement)
  const activePlayIndex = useEditorStore((s) => s.activePlayIndex)
  const activeStepIndex = useEditorStore((s) => s.activeStepIndex)

  const disabled = activePlayIndex < 0 || activeStepIndex < 0

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-800 rounded-lg">
      {TOOLS.map((tool) => (
        <button
          key={tool.label}
          title={tool.label}
          disabled={disabled}
          onClick={() => addElement(tool.action())}
          className="w-10 h-10 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-lg"
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}
```

**Paso 3: Crear StepNavigator**

```typescript
// src/components/editor/StepNavigator.tsx
import { useEditorStore } from '../../stores/editor-store'
import { LimitIndicator } from '../ui/LimitIndicator'
import { MAX_STEPS_PER_PLAY } from '../../lib/constants'

export function StepNavigator() {
  const activePlayIndex = useEditorStore((s) => s.activePlayIndex)
  const activeStepIndex = useEditorStore((s) => s.activeStepIndex)
  const plays = useEditorStore((s) => s.session.plays)
  const setActiveStep = useEditorStore((s) => s.setActiveStep)
  const addStep = useEditorStore((s) => s.addStep)
  const removeStep = useEditorStore((s) => s.removeStep)
  const duplicateStep = useEditorStore((s) => s.duplicateStep)

  if (activePlayIndex < 0) return null

  const play = plays[activePlayIndex]
  if (!play) return null

  const totalSteps = play.steps.length

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
      <button
        disabled={activeStepIndex <= 0}
        onClick={() => setActiveStep(activeStepIndex - 1)}
        className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30"
      >
        ◀
      </button>

      <span className="text-white text-sm min-w-[80px] text-center">
        Paso {activeStepIndex + 1} / {totalSteps}
      </span>

      <button
        disabled={activeStepIndex >= totalSteps - 1}
        onClick={() => setActiveStep(activeStepIndex + 1)}
        className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30"
      >
        ▶
      </button>

      <div className="border-l border-gray-600 pl-2 ml-2 flex gap-1">
        <button
          disabled={totalSteps >= MAX_STEPS_PER_PLAY}
          onClick={addStep}
          className="px-2 py-1 rounded bg-green-700 hover:bg-green-600 text-white text-sm disabled:opacity-30"
          title="Agregar paso"
        >
          +
        </button>

        <button
          disabled={activeStepIndex < 0}
          onClick={() => duplicateStep(activeStepIndex)}
          className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm disabled:opacity-30"
          title="Duplicar paso actual"
        >
          ⧉
        </button>

        <button
          disabled={totalSteps <= 1}
          onClick={() => {
            const stepId = play.steps[activeStepIndex]?.id
            if (stepId) removeStep(stepId)
          }}
          className="px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-sm disabled:opacity-30"
          title="Eliminar paso"
        >
          ✕
        </button>
      </div>

      <div className="ml-auto">
        <LimitIndicator current={totalSteps} max={MAX_STEPS_PER_PLAY} label="Pasos" />
      </div>
    </div>
  )
}
```

**Paso 4: Crear PlayListPanel**

```typescript
// src/components/editor/PlayListPanel.tsx
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

  const handleAddPlay = () => {
    const title = newPlayTitle.trim() || `Jugada ${plays.length + 1}`
    addPlay(title)
    setNewPlayTitle('')
    setActivePlay(plays.length) // seleccionar la nueva
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg w-64 flex flex-col gap-3">
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
          className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-sm placeholder:text-gray-500"
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
          <li
            key={play.id}
            onClick={() => setActivePlay(index)}
            className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer text-sm ${
              index === activePlayIndex
                ? 'bg-blue-700 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="truncate">{play.title}</span>
            <div className="flex gap-1">
              {index > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); reorderPlays(index, index - 1) }}
                  className="text-xs opacity-50 hover:opacity-100"
                >
                  ▲
                </button>
              )}
              {index < plays.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); reorderPlays(index, index + 1) }}
                  className="text-xs opacity-50 hover:opacity-100"
                >
                  ▼
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removePlay(play.id) }}
                className="text-xs text-red-400 opacity-50 hover:opacity-100 ml-1"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

**Paso 5: Crear EditorLayout**

```typescript
// src/components/editor/EditorLayout.tsx
import { useCallback, useRef, useState, useEffect } from 'react'
import { Stage } from 'react-konva'
import { FieldRenderer } from '../field/FieldRenderer'
import { PlayListPanel } from './PlayListPanel'
import { StepNavigator } from './StepNavigator'
import { ElementToolbar } from './ElementToolbar'
import { useEditorStore } from '../../stores/editor-store'
import { FIELD } from '../../lib/constants'

export function EditorLayout() {
  const session = useEditorStore((s) => s.session)
  const activePlayIndex = useEditorStore((s) => s.activePlayIndex)
  const activeStepIndex = useEditorStore((s) => s.activeStepIndex)
  const moveElement = useEditorStore((s) => s.moveElement)
  const selectElement = useEditorStore((s) => s.selectElement)

  const containerRef = useRef<HTMLDivElement>(null)
  const [fieldWidth, setFieldWidth] = useState(500)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const available = containerRef.current.clientWidth
        setFieldWidth(Math.min(available, 600))
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const fieldHeight = Math.round(fieldWidth * FIELD.ASPECT_RATIO)

  const currentElements =
    activePlayIndex >= 0 && activeStepIndex >= 0
      ? session.plays[activePlayIndex]?.steps[activeStepIndex]?.elements ?? []
      : []

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      moveElement(id, x, y)
    },
    [moveElement],
  )

  return (
    <div className="flex gap-4 p-4 bg-gray-950 min-h-screen">
      {/* Panel izquierdo: lista de jugadas */}
      <PlayListPanel />

      {/* Centro: cancha + controles */}
      <div className="flex-1 flex flex-col gap-3 items-center">
        <div className="w-full">
          <input
            type="text"
            value={session.title}
            onChange={(e) => useEditorStore.getState().updateSessionTitle(e.target.value)}
            className="bg-transparent text-white text-xl font-bold border-b border-gray-700 focus:border-blue-500 outline-none w-full pb-1"
          />
        </div>

        <ElementToolbar />

        <div ref={containerRef} className="w-full flex justify-center">
          <Stage width={fieldWidth} height={fieldHeight}>
            <FieldRenderer
              width={fieldWidth}
              height={fieldHeight}
              elements={currentElements}
              draggable
              onElementDragEnd={handleDragEnd}
              onElementSelect={selectElement}
            />
          </Stage>
        </div>

        <StepNavigator />
      </div>
    </div>
  )
}
```

**Paso 6: Conectar EditorLayout a la ruta del backoffice**

```typescript
// src/pages/BackofficePage.tsx
import { EditorLayout } from '../components/editor/EditorLayout'

export function BackofficePage() {
  return <EditorLayout />
}
```

**Paso 7: Verificar visualmente**

```bash
pnpm dev
```

Navegar a `/backoffice`. Esperado: Layout con panel de jugadas a la izquierda, cancha en el centro, toolbar de elementos arriba, navegador de pasos abajo.

**Paso 8: Hacer commit**

```bash
git add .
git commit -m "feat: add editor layout with play list, step navigator, and element toolbar"
```

---

## Fase 6: API y Persistencia

### Tarea 6.1: Netlify Functions — CRUD de sesiones

**Archivos:**
- Crear: `netlify/functions/api.ts`

**Paso 1: Instalar dependencias de Netlify**

```bash
pnpm add -D @netlify/functions @netlify/blobs
```

**Paso 2: Implementar la function**

```typescript
// netlify/functions/api.ts
import type { Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

const STORE_NAME = 'sessions'
const AUTH_TOKEN = process.env.DT_MAGIC_TOKEN ?? 'dev-token'

function unauthorized() {
  return new Response(JSON.stringify({ error: 'No autorizado' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

function notFound() {
  return new Response(JSON.stringify({ error: 'Sesión no encontrada' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(req: Request, context: Context) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/.netlify/functions/api', '').replace('/api', '')
  const method = req.method

  // Rutas públicas (visor): GET /sessions/:id no requiere auth
  const publicGet = method === 'GET' && /^\/sessions\/[\w-]+$/.test(path)

  // Auth para rutas protegidas
  if (!publicGet) {
    const token =
      url.searchParams.get('token') ??
      req.headers.get('Authorization')?.replace('Bearer ', '')
    if (token !== AUTH_TOKEN) {
      return unauthorized()
    }
  }

  const store = getStore(STORE_NAME)

  // GET /sessions — listar todas
  if (method === 'GET' && path === '/sessions') {
    const { blobs } = await store.list()
    const sessions = await Promise.all(
      blobs.map(async (blob) => {
        const data = await store.get(blob.key, { type: 'json' })
        return data
      }),
    )
    return json(sessions.filter(Boolean))
  }

  // GET /sessions/:id — obtener una sesión
  const getMatch = path.match(/^\/sessions\/([\w-]+)$/)
  if (method === 'GET' && getMatch) {
    const id = getMatch[1]
    const session = await store.get(id, { type: 'json' })
    if (!session) return notFound()
    return json(session)
  }

  // POST /sessions — crear sesión
  if (method === 'POST' && path === '/sessions') {
    const session = await req.json()
    await store.setJSON(session.id, session)
    return json(session, 201)
  }

  // PUT /sessions/:id — actualizar sesión
  const putMatch = path.match(/^\/sessions\/([\w-]+)$/)
  if (method === 'PUT' && putMatch) {
    const id = putMatch[1]
    const session = await req.json()
    await store.setJSON(id, { ...session, id })
    return json(session)
  }

  // DELETE /sessions/:id — eliminar sesión
  const deleteMatch = path.match(/^\/sessions\/([\w-]+)$/)
  if (method === 'DELETE' && deleteMatch) {
    const id = deleteMatch[1]
    await store.delete(id)
    return json({ deleted: true })
  }

  return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

**Paso 3: Hacer commit**

```bash
git add .
git commit -m "feat: add netlify function for session CRUD API"
```

---

### Tarea 6.2: Cliente API en el frontend

**Archivos:**
- Crear: `src/api/sessions.ts`

**Paso 1: Implementar el cliente**

```typescript
// src/api/sessions.ts
import type { Session } from '../types'

function getToken(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') ?? ''
}

function apiUrl(path: string): string {
  return `/api${path}`
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(error.error ?? `Error ${res.status}`)
  }

  return res.json()
}

export async function listSessions(): Promise<Session[]> {
  return apiFetch<Session[]>('/sessions')
}

export async function getSession(id: string): Promise<Session> {
  // Lectura pública, no necesita token
  const res = await fetch(apiUrl(`/sessions/${id}`))
  if (!res.ok) throw new Error('Sesión no encontrada')
  return res.json()
}

export async function createSession(session: Session): Promise<Session> {
  return apiFetch<Session>('/sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  })
}

export async function updateSession(session: Session): Promise<Session> {
  return apiFetch<Session>(`/sessions/${session.id}`, {
    method: 'PUT',
    body: JSON.stringify(session),
  })
}

export async function deleteSession(id: string): Promise<void> {
  await apiFetch(`/sessions/${id}`, { method: 'DELETE' })
}
```

**Paso 2: Hacer commit**

```bash
git add .
git commit -m "feat: add API client for session CRUD"
```

---

## Fase 7: Sesiones — CRUD + Listado

### Tarea 7.1: Página de listado de sesiones

**Archivos:**
- Crear: `src/components/sessions/SessionList.tsx`
- Crear: `src/components/sessions/SessionCard.tsx`
- Modificar: `src/pages/BackofficePage.tsx`

**Paso 1: Crear SessionCard**

```typescript
// src/components/sessions/SessionCard.tsx
import type { Session } from '../../types'

interface SessionCardProps {
  session: Session
  onEdit: (session: Session) => void
  onDelete: (id: string) => void
  onShare: (session: Session) => void
}

export function SessionCard({ session, onEdit, onDelete, onShare }: SessionCardProps) {
  const playCount = session.plays.length
  const updatedAt = new Date(session.updatedAt).toLocaleDateString('es-AR')

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
      <h3 className="text-white font-bold text-lg">{session.title}</h3>
      {session.description && (
        <p className="text-gray-400 text-sm">{session.description}</p>
      )}
      <div className="text-gray-500 text-xs">
        {playCount} jugada{playCount !== 1 ? 's' : ''} · Actualizada {updatedAt}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onEdit(session)}
          className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm"
        >
          Editar
        </button>
        <button
          onClick={() => onShare(session)}
          className="px-3 py-1 rounded bg-green-700 hover:bg-green-600 text-white text-sm"
        >
          Compartir
        </button>
        <button
          onClick={() => onDelete(session.id)}
          className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-sm ml-auto"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
```

**Paso 2: Crear SessionList**

```typescript
// src/components/sessions/SessionList.tsx
import { useEffect, useState } from 'react'
import { SessionCard } from './SessionCard'
import { listSessions, deleteSession as apiDeleteSession } from '../../api/sessions'
import { createSession as createSessionFactory } from '../../domain/factories'
import { createSession as apiCreateSession } from '../../api/sessions'
import type { Session } from '../../types'

interface SessionListProps {
  onEditSession: (session: Session) => void
}

export function SessionList({ onEditSession }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    setLoading(true)
    try {
      const data = await listSessions()
      setSessions(data)
    } catch {
      console.error('Error cargando sesiones')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    const title = newTitle.trim() || 'Nueva Sesión'
    const session = createSessionFactory({ title })
    await apiCreateSession(session)
    setNewTitle('')
    onEditSession(session)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta sesión? Los links compartidos dejarán de funcionar.')) return
    await apiDeleteSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  function handleShare(session: Session) {
    const url = `${window.location.origin}/s/${session.id}`
    navigator.clipboard.writeText(url)
    alert(`Link copiado:\n${url}`)
  }

  if (loading) {
    return <div className="text-gray-400 p-8">Cargando sesiones...</div>
  }

  return (
    <div className="p-8 bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Mis Sesiones</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Nombre de la sesión..."
          className="flex-1 max-w-md px-4 py-2 rounded bg-gray-800 text-white placeholder:text-gray-500"
        />
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-bold"
        >
          Crear Sesión
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-500">No hay sesiones todavía. ¡Creá la primera!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={onEditSession}
              onDelete={handleDelete}
              onShare={handleShare}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Paso 3: Actualizar BackofficePage con navegación interna**

```typescript
// src/pages/BackofficePage.tsx
import { useState } from 'react'
import { SessionList } from '../components/sessions/SessionList'
import { EditorLayout } from '../components/editor/EditorLayout'
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

  if (view === 'editor') {
    return (
      <div>
        <div className="bg-gray-900 p-2">
          <button
            onClick={handleBackToList}
            className="text-gray-400 hover:text-white text-sm px-3 py-1"
          >
            ← Volver a sesiones
          </button>
        </div>
        <EditorLayout />
      </div>
    )
  }

  return <SessionList onEditSession={handleEditSession} />
}
```

**Paso 4: Verificar visualmente**

```bash
pnpm dev
```

Esperado: Lista de sesiones en `/backoffice`, botón crear, cards con editar/compartir/eliminar.

**Paso 5: Hacer commit**

```bash
git add .
git commit -m "feat: add session list with create, edit, share, and delete"
```

---

### Tarea 7.2: Guardado automático en el editor

**Archivos:**
- Crear: `src/hooks/useAutoSave.ts`
- Modificar: `src/components/editor/EditorLayout.tsx`

**Paso 1: Crear hook de auto-save**

```typescript
// src/hooks/useAutoSave.ts
import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../stores/editor-store'
import { updateSession } from '../api/sessions'

export function useAutoSave(debounceMs = 2000) {
  const session = useEditorStore((s) => s.session)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        await updateSession(session)
        setLastSaved(new Date())
      } catch (err) {
        console.error('Error guardando sesión:', err)
      } finally {
        setSaving(false)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [session, debounceMs])

  return { saving, lastSaved }
}
```

**Paso 2: Integrar en EditorLayout**

Agregar al componente `EditorLayout` debajo del título:

```typescript
// En EditorLayout.tsx, agregar:
import { useAutoSave } from '../../hooks/useAutoSave'

// Dentro del componente:
const { saving, lastSaved } = useAutoSave()

// En el JSX, debajo del input del título:
<div className="text-xs text-gray-500">
  {saving ? 'Guardando...' : lastSaved ? `Guardado ${lastSaved.toLocaleTimeString('es-AR')}` : ''}
</div>
```

**Paso 3: Hacer commit**

```bash
git add .
git commit -m "feat: add auto-save with debounce for editor"
```

---

## Fase 8: Motor de Animación

### Tarea 8.1: Función de interpolación entre pasos

**Archivos:**
- Crear: `src/domain/animation.ts`
- Crear: `src/__tests__/domain/animation.test.ts`

**Paso 1: Escribir tests**

```typescript
// src/__tests__/domain/animation.test.ts
import { describe, it, expect } from 'vitest'
import { interpolateElements } from '../../domain/animation'
import { createPlayer, createBall } from '../../domain/factories'
import type { FieldElement } from '../../types'

describe('interpolateElements', () => {
  it('interpola posiciones entre dos pasos (t=0.5)', () => {
    const step1: FieldElement[] = [
      { ...createPlayer({ x: 0, y: 0, team: 'own', label: '7' }), id: 'p1' },
    ]
    const step2: FieldElement[] = [
      { ...createPlayer({ x: 100, y: 100, team: 'own', label: '7' }), id: 'p1' },
    ]

    const result = interpolateElements(step1, step2, 0.5)
    expect(result[0].x).toBeCloseTo(50)
    expect(result[0].y).toBeCloseTo(50)
  })

  it('devuelve step1 cuando t=0', () => {
    const step1: FieldElement[] = [
      { ...createPlayer({ x: 20, y: 30, team: 'own', label: '7' }), id: 'p1' },
    ]
    const step2: FieldElement[] = [
      { ...createPlayer({ x: 80, y: 90, team: 'own', label: '7' }), id: 'p1' },
    ]

    const result = interpolateElements(step1, step2, 0)
    expect(result[0].x).toBe(20)
    expect(result[0].y).toBe(30)
  })

  it('devuelve step2 cuando t=1', () => {
    const step1: FieldElement[] = [
      { ...createPlayer({ x: 20, y: 30, team: 'own', label: '7' }), id: 'p1' },
    ]
    const step2: FieldElement[] = [
      { ...createPlayer({ x: 80, y: 90, team: 'own', label: '7' }), id: 'p1' },
    ]

    const result = interpolateElements(step1, step2, 1)
    expect(result[0].x).toBe(80)
    expect(result[0].y).toBe(90)
  })

  it('maneja elementos que solo existen en step2 (aparecen)', () => {
    const step1: FieldElement[] = []
    const step2: FieldElement[] = [
      { ...createBall({ x: 50, y: 50 }), id: 'b1' },
    ]

    const result = interpolateElements(step1, step2, 0.5)
    expect(result).toHaveLength(1)
    expect(result[0].x).toBe(50)
  })

  it('interpola flechas (toX, toY)', () => {
    const step1: FieldElement[] = [
      { id: 'a1', type: 'arrow', x: 0, y: 0, toX: 10, toY: 10, style: 'pass' as const },
    ]
    const step2: FieldElement[] = [
      { id: 'a1', type: 'arrow', x: 50, y: 50, toX: 60, toY: 60, style: 'pass' as const },
    ]

    const result = interpolateElements(step1, step2, 0.5)
    const arrow = result[0] as any
    expect(arrow.x).toBeCloseTo(25)
    expect(arrow.toX).toBeCloseTo(35)
  })
})
```

**Paso 2: Ejecutar tests para confirmar que fallan**

```bash
pnpm test:run src/__tests__/domain/animation.test.ts
```

Esperado: FAIL.

**Paso 3: Implementar interpolación**

```typescript
// src/domain/animation.ts
import type { FieldElement } from '../types'

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function interpolateElements(
  fromElements: FieldElement[],
  toElements: FieldElement[],
  t: number,
): FieldElement[] {
  // Crear mapa de elementos por id para el paso "from"
  const fromMap = new Map(fromElements.map((el) => [el.id, el]))

  // Interpolar cada elemento del paso "to"
  return toElements.map((toEl) => {
    const fromEl = fromMap.get(toEl.id)

    // Si el elemento no existía en "from", aparece directamente en su posición final
    if (!fromEl) return { ...toEl }

    // Interpolar posiciones base
    const interpolated = {
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
      }
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
      }
    }

    return interpolated
  })
}
```

**Paso 4: Ejecutar tests para confirmar que pasan**

```bash
pnpm test:run src/__tests__/domain/animation.test.ts
```

Esperado: PASS.

**Paso 5: Hacer commit**

```bash
git add .
git commit -m "feat: add element interpolation engine for step transitions"
```

---

### Tarea 8.2: Hook de animación

**Archivos:**
- Crear: `src/hooks/useAnimation.ts`

**Paso 1: Implementar el hook**

```typescript
// src/hooks/useAnimation.ts
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
  progress: number  // 0-1 progreso total
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
  const rafRef = useRef<number>()
  const startTimeRef = useRef<number>(0)

  const totalSteps = steps.length

  // Calcular elementos actuales (interpolados o estáticos)
  const currentElements = (() => {
    if (totalSteps === 0) return []
    if (interpolationT === 0 || currentStepIndex === 0) {
      return steps[currentStepIndex]?.elements ?? []
    }
    const fromStep = steps[currentStepIndex - 1]
    const toStep = steps[currentStepIndex]
    if (!fromStep || !toStep) return steps[currentStepIndex]?.elements ?? []
    return interpolateElements(fromStep.elements, toStep.elements, interpolationT)
  })()

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp

      const elapsed = timestamp - startTimeRef.current
      const t = Math.min(elapsed / stepDurationMs, 1)
      setInterpolationT(t)

      if (t >= 1) {
        // Transición completada, avanzar al siguiente paso
        setInterpolationT(0)
        startTimeRef.current = 0

        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }

      if (t < 1 || currentStepIndex < totalSteps - 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    },
    [stepDurationMs, totalSteps, currentStepIndex],
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

  const play = useCallback(() => {
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0)
    }
    setIsPlaying(true)
  }, [currentStepIndex, totalSteps])

  const pause = useCallback(() => {
    setIsPlaying(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const stop = useCallback(() => {
    setIsPlaying(false)
    setCurrentStepIndex(0)
    setInterpolationT(0)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const goToStep = useCallback((index: number) => {
    setCurrentStepIndex(Math.max(0, Math.min(index, totalSteps - 1)))
    setInterpolationT(0)
  }, [totalSteps])

  const nextStep = useCallback(() => {
    goToStep(currentStepIndex + 1)
  }, [currentStepIndex, goToStep])

  const prevStep = useCallback(() => {
    goToStep(currentStepIndex - 1)
  }, [currentStepIndex, goToStep])

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
```

**Paso 2: Hacer commit**

```bash
git add .
git commit -m "feat: add useAnimation hook with interpolation and playback controls"
```

---

## Fase 9: Visor Público (Mobile-First)

### Tarea 9.1: Componente del visor

**Archivos:**
- Crear: `src/components/viewer/SessionViewer.tsx`
- Crear: `src/components/viewer/PlaybackControls.tsx`
- Modificar: `src/pages/ViewerPage.tsx`

**Paso 1: Crear PlaybackControls**

```typescript
// src/components/viewer/PlaybackControls.tsx
interface PlaybackControlsProps {
  isPlaying: boolean
  currentStep: number
  totalSteps: number
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onNextStep: () => void
  onPrevStep: () => void
}

export function PlaybackControls({
  isPlaying,
  currentStep,
  totalSteps,
  onPlay,
  onPause,
  onStop,
  onNextStep,
  onPrevStep,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-3">
      <button
        onClick={onStop}
        className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center"
      >
        ■
      </button>
      <button
        onClick={onPrevStep}
        disabled={currentStep <= 0}
        className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center disabled:opacity-30"
      >
        ◀◀
      </button>
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center text-xl"
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>
      <button
        onClick={onNextStep}
        disabled={currentStep >= totalSteps - 1}
        className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center disabled:opacity-30"
      >
        ▶▶
      </button>
      <span className="text-gray-400 text-sm ml-2">
        {currentStep + 1}/{totalSteps}
      </span>
    </div>
  )
}
```

**Paso 2: Crear SessionViewer**

```typescript
// src/components/viewer/SessionViewer.tsx
import { useState, useRef, useEffect } from 'react'
import { Stage } from 'react-konva'
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
      <div className="p-4 text-center">
        <h1 className="text-white font-bold text-lg">{session.title}</h1>
        {session.description && (
          <p className="text-gray-400 text-sm mt-1">{session.description}</p>
        )}
      </div>

      {/* Play selector */}
      <div className="flex overflow-x-auto gap-2 px-4 pb-2">
        {session.plays.map((play, index) => (
          <button
            key={play.id}
            onClick={() => { setActivePlayIndex(index); stop() }}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              index === activePlayIndex
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {play.title}
          </button>
        ))}
      </div>

      {/* Notes */}
      {currentPlay?.notes && (
        <div className="mx-4 p-2 bg-gray-800 rounded text-gray-300 text-sm">
          {currentPlay.notes}
        </div>
      )}

      {/* Field */}
      <div ref={containerRef} className="flex-1 flex justify-center items-center p-2">
        <Stage width={fieldWidth} height={fieldHeight}>
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
```

**Paso 3: Actualizar ViewerPage**

```typescript
// src/pages/ViewerPage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { SessionViewer } from '../components/viewer/SessionViewer'
import { getSession } from '../api/sessions'
import type { Session } from '../types'

export function ViewerPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    getSession(sessionId)
      .then(setSession)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-400">
        Cargando sesión...
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Sesión no disponible</h1>
          <p className="text-gray-400">
            Esta sesión fue eliminada o el link es incorrecto.
          </p>
        </div>
      </div>
    )
  }

  return <SessionViewer session={session} />
}
```

**Paso 4: Verificar visualmente**

```bash
pnpm dev
```

Navegar a `/s/test123`. Esperado: Muestra "Sesión no disponible" (no existe en el backend aún).

**Paso 5: Hacer commit**

```bash
git add .
git commit -m "feat: add public session viewer with animation playback"
```

---

## Fase 10: Auth por Magic Link

### Tarea 10.1: Proteger el backoffice

**Archivos:**
- Crear: `src/components/ui/AuthGuard.tsx`
- Modificar: `src/pages/BackofficePage.tsx`

**Paso 1: Crear AuthGuard**

```typescript
// src/components/ui/AuthGuard.tsx
import { type ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Acceso restringido</h1>
          <p className="text-gray-400">
            Necesitás un link de acceso válido para entrar al backoffice.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

**Paso 2: Envolver BackofficePage con AuthGuard**

```typescript
// src/pages/BackofficePage.tsx — agregar AuthGuard
import { AuthGuard } from '../components/ui/AuthGuard'

// Envolver el return:
export function BackofficePage() {
  // ... (estado existente)

  return (
    <AuthGuard>
      {/* contenido existente */}
    </AuthGuard>
  )
}
```

> **NOTA:** La validación real del token ocurre en el backend (Netlify Function). El AuthGuard del frontend es solo UX — evita que alguien sin token vea una pantalla rota. La seguridad real está en la API.

**Paso 3: Hacer commit**

```bash
git add .
git commit -m "feat: add AuthGuard for backoffice magic link protection"
```

---

## Fase 11: WhatsApp Link Preview (OG Meta)

### Tarea 11.1: Edge Function para meta tags

**Archivos:**
- Crear: `netlify/edge-functions/og-meta.ts`
- Modificar: `netlify.toml`

**Paso 1: Crear Edge Function**

```typescript
// netlify/edge-functions/og-meta.ts
import type { Context } from 'https://edge.netlify.com'

export default async function handler(req: Request, context: Context) {
  const url = new URL(req.url)
  const match = url.pathname.match(/^\/s\/([\w-]+)$/)

  if (!match) return context.next()

  const sessionId = match[1]

  // Intentar obtener la sesión para el título
  let title = 'Sesión de Entrenamiento'
  try {
    const apiUrl = new URL(`/.netlify/functions/api/sessions/${sessionId}`, url.origin)
    const res = await fetch(apiUrl.toString())
    if (res.ok) {
      const session = await res.json()
      title = session.title ?? title
    }
  } catch {
    // Si falla, usar título genérico
  }

  // Verificar si es un bot/crawler (WhatsApp, Telegram, etc.)
  const userAgent = req.headers.get('user-agent') ?? ''
  const isCrawler = /WhatsApp|Telegram|facebookexternalhit|Twitterbot|LinkedInBot/i.test(userAgent)

  if (!isCrawler) return context.next()

  // Servir HTML con meta tags para crawlers
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="Abrí el link para ver las jugadas animadas de esta sesión de entrenamiento.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url.toString()}">
</head>
<body></body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export const config = { path: '/s/*' }
```

**Paso 2: Registrar edge function en netlify.toml**

Agregar al final de `netlify.toml`:

```toml
[[edge_functions]]
  function = "og-meta"
  path = "/s/*"
```

**Paso 3: Hacer commit**

```bash
git add .
git commit -m "feat: add edge function for WhatsApp OG meta tags"
```

---

## Fase 12: Polish y UX

### Tarea 12.1: Preview "ver como jugador" en el editor

**Archivos:**
- Modificar: `src/components/editor/EditorLayout.tsx`

**Paso 1: Agregar botón de preview y modal/overlay**

Agregar un estado `previewMode` al `EditorLayout`. Cuando está activo, renderizar el `SessionViewer` en un overlay/modal.

```typescript
// En EditorLayout.tsx, agregar:
import { SessionViewer } from '../viewer/SessionViewer'

// Estado:
const [previewMode, setPreviewMode] = useState(false)

// Botón en el JSX (junto al título):
<button
  onClick={() => setPreviewMode(true)}
  className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white text-sm"
>
  Vista jugador
</button>

// Overlay:
{previewMode && (
  <div className="fixed inset-0 z-50 bg-black">
    <button
      onClick={() => setPreviewMode(false)}
      className="absolute top-4 right-4 z-50 px-3 py-1 rounded bg-gray-700 text-white"
    >
      Cerrar
    </button>
    <SessionViewer session={session} />
  </div>
)}
```

**Paso 2: Hacer commit**

```bash
git add .
git commit -m "feat: add player preview mode in editor"
```

---

### Tarea 12.2: Mejoras de UX — estados vacíos, errores, loading

**Archivos:**
- Revisar y mejorar todos los componentes con estados vacíos y de error

**Paso 1: Revisar cada componente y agregar feedback visual adecuado**

Verificar que:
- `SessionList`: muestra mensaje cuando no hay sesiones
- `EditorLayout`: muestra indicación cuando no hay jugada seleccionada
- `ViewerPage`: muestra "Sesión no disponible" para sesiones eliminadas
- `LimitIndicator`: cambia a rojo cuando se alcanza el límite
- Los botones deshabilitados tienen `disabled:opacity-30`

**Paso 2: Hacer commit**

```bash
git add .
git commit -m "fix: improve empty states, error messages, and loading indicators"
```

---

### Tarea 12.3: Netlify redirects finales

**Archivos:**
- Modificar: `netlify.toml`

**Paso 1: Verificar que los redirects cubren todos los casos**

```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"
  functions = "netlify/functions"

# API routes (primero, más específicas)
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

# SPA fallback (último, catch-all)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[edge_functions]]
  function = "og-meta"
  path = "/s/*"
```

**Paso 2: Hacer commit**

```bash
git add .
git commit -m "fix: finalize netlify redirects for API and SPA"
```

---

## Resumen de Fases y Entregables

| Fase | Tareas | Entregable |
|------|--------|------------|
| 1. Scaffolding | 1.1–1.5 | Proyecto Vite corriendo con React Router, Tailwind, Vitest, Netlify config |
| 2. Dominio | 2.1–2.4 | Tipos, factories, validaciones — todo con tests |
| 3. Cancha | 3.1–3.3 | Cancha FIH renderizada con todos los elementos visuales |
| 4. State | 4.1 | Zustand store completo con tests |
| 5. Editor UI | 5.1 | Layout del editor con toolbar, lista de jugadas, navegador de pasos |
| 6. API | 6.1–6.2 | Netlify Functions + cliente API |
| 7. Sesiones | 7.1–7.2 | CRUD de sesiones + auto-save |
| 8. Animación | 8.1–8.2 | Motor de interpolación + hook de playback |
| 9. Visor | 9.1 | Visor público mobile-first con controles de reproducción |
| 10. Auth | 10.1 | Magic link guard |
| 11. OG Meta | 11.1 | WhatsApp preview con Edge Function |
| 12. Polish | 12.1–12.3 | Preview de jugador, estados vacíos, redirects finales |
