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

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/.netlify/functions/api', '').replace('/api', '')
  const method = req.method

  // Rutas públicas: GET /sessions/:id no requiere auth
  const publicGet = method === 'GET' && /^\/sessions\/[\w-]+$/.test(path)

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

  // GET /sessions/:id
  const getMatch = path.match(/^\/sessions\/([\w-]+)$/)
  if (method === 'GET' && getMatch) {
    const id = getMatch[1]
    const session = await store.get(id, { type: 'json' })
    if (!session) return notFound()
    return json(session)
  }

  // POST /sessions
  if (method === 'POST' && path === '/sessions') {
    const session = await req.json()
    await store.setJSON(session.id, session)
    return json(session, 201)
  }

  // PUT /sessions/:id
  const putMatch = path.match(/^\/sessions\/([\w-]+)$/)
  if (method === 'PUT' && putMatch) {
    const id = putMatch[1]
    const session = await req.json()
    await store.setJSON(id, { ...session, id })
    return json(session)
  }

  // DELETE /sessions/:id
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
