/**
 * Vite plugin that mocks the Netlify Functions API during local dev.
 * Stores sessions as JSON files in ./data/
 */
import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.resolve(import.meta.dirname, 'data')
const DEV_TOKEN = 'dev-token'

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function sessionPath(id: string) {
  return path.join(DATA_DIR, `${id}.json`)
}

function json(res: any, data: unknown, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: string) => (body += chunk))
    req.on('end', () => resolve(body))
  })
}

export function devApiPlugin(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '', `http://${req.headers.host}`)
        const apiPath = url.pathname

        if (!apiPath.startsWith('/api/')) return next()

        ensureDataDir()

        const route = apiPath.replace('/api', '')
        const method = req.method ?? 'GET'

        // Public GET: /api/sessions/:id (no auth needed)
        const isPublicGet = method === 'GET' && /^\/sessions\/[\w-]+$/.test(route)

        // Auth check for non-public routes
        if (!isPublicGet) {
          const token =
            url.searchParams.get('token') ??
            req.headers.authorization?.replace('Bearer ', '')
          if (token !== DEV_TOKEN) {
            return json(res, { error: 'No autorizado' }, 401)
          }
        }

        // GET /sessions — list all
        if (method === 'GET' && route === '/sessions') {
          const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
          const sessions = files.map((f) => {
            const content = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')
            return JSON.parse(content)
          })
          return json(res, sessions)
        }

        // GET /sessions/:id
        const getMatch = route.match(/^\/sessions\/([\w-]+)$/)
        if (method === 'GET' && getMatch) {
          const filePath = sessionPath(getMatch[1])
          if (!fs.existsSync(filePath)) {
            return json(res, { error: 'Sesión no encontrada' }, 404)
          }
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          return json(res, data)
        }

        // POST /sessions
        if (method === 'POST' && route === '/sessions') {
          const body = await readBody(req)
          const session = JSON.parse(body)
          fs.writeFileSync(sessionPath(session.id), JSON.stringify(session, null, 2))
          return json(res, session, 201)
        }

        // PUT /sessions/:id
        const putMatch = route.match(/^\/sessions\/([\w-]+)$/)
        if (method === 'PUT' && putMatch) {
          const body = await readBody(req)
          const session = JSON.parse(body)
          fs.writeFileSync(sessionPath(putMatch[1]), JSON.stringify({ ...session, id: putMatch[1] }, null, 2))
          return json(res, session)
        }

        // DELETE /sessions/:id
        const deleteMatch = route.match(/^\/sessions\/([\w-]+)$/)
        if (method === 'DELETE' && deleteMatch) {
          const filePath = sessionPath(deleteMatch[1])
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
          return json(res, { deleted: true })
        }

        return json(res, { error: 'Ruta no encontrada' }, 404)
      })
    },
  }
}
