# Hockey Training

Backoffice para que un DT (director tecnico) de hockey sobre cesped diseñe sesiones de entrenamiento con jugadas animadas y las comparta por link con sus jugadoras.

## El problema

Un DT de hockey no tiene una forma comoda de comunicar jugadas a sus jugadoras. Los metodos actuales (dibujos en papel, capturas de pizarras, audios por WhatsApp) son estaticos y ambiguos. Una jugada de hockey es movimiento en el tiempo — jugadoras que se desplazan, pases, tiros. Una imagen fija pierde justamente eso.

## La solucion

Una herramienta web donde el DT:

1. **Crea sesiones** de entrenamiento agrupando varias jugadas
2. **Diseña jugadas** colocando jugadoras, pelota, conos, arcos, flechas y texto sobre una cancha FIH reglamentaria
3. **Define pasos/keyframes** para animar el movimiento de los elementos entre posiciones
4. **Comparte por link** cada sesion via WhatsApp — las jugadoras abren el link en el celular y ven las jugadas animadas sin instalar nada

## Stack tecnico

- **Frontend:** React 19 + Vite + TypeScript
- **Canvas:** Konva (react-konva) para la cancha y los elementos
- **Estado:** Zustand
- **Estilos:** TailwindCSS 4
- **API:** Netlify Functions
- **Storage:** Netlify Blobs (archivos JSON, sin base de datos)
- **Deploy:** Netlify con CI/CD via GitHub Actions

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Abrir `http://localhost:5173/backoffice?token=dev-token`

El plugin de Vite intercepta las llamadas a `/api/*` y almacena las sesiones como archivos JSON en la carpeta `data/`.

## Tests

```bash
pnpm test        # watch mode
pnpm test:run    # single run
```

## Build

```bash
pnpm build
```

## Deploy

El deploy es automatico: cada push a `main` dispara el workflow de GitHub Actions que corre los tests, hace build y publica en Netlify.

### Secrets necesarios en GitHub

| Secret | Descripcion |
|--------|-------------|
| `NETLIFY_AUTH_TOKEN` | Personal access token de Netlify (Settings > Applications > Personal access tokens) |
| `NETLIFY_SITE_ID` | ID del sitio en Netlify (`ec60ff02-0edb-4455-8cd1-dafbf9eb2962`) |

### Variables de entorno en Netlify

| Variable | Descripcion |
|----------|-------------|
| `DT_MAGIC_TOKEN` | Token largo y aleatorio para el magic link del DT |

## Arquitectura

```
Netlify
├── Static SPA (React)
│   ├── /backoffice?token=xxx  ← DT edita (magic link)
│   └── /s/:sessionId          ← Jugadoras ven (publico)
│
├── Netlify Functions
│   └── /api/sessions/*        ← CRUD de sesiones
│
├── Netlify Blobs
│   └── session-{id}.json      ← Datos de cada sesion
│
└── Edge Function
    └── /s/*                   ← OG meta tags para WhatsApp
```

## URL de produccion

**App:** https://hockey-training-app.netlify.app

**Backoffice:** `https://hockey-training-app.netlify.app/backoffice?token=TU_TOKEN`

**Visor (jugadoras):** `https://hockey-training-app.netlify.app/s/{sessionId}`
