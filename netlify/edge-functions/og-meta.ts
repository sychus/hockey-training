import type { Context } from 'https://edge.netlify.com'

export default async function handler(req: Request, context: Context) {
  const url = new URL(req.url)
  const match = url.pathname.match(/^\/s\/([\w-]+)$/)

  if (!match) return context.next()

  // Verificar si es un bot/crawler (WhatsApp, Telegram, etc.)
  const userAgent = req.headers.get('user-agent') ?? ''
  const isCrawler = /WhatsApp|Telegram|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot/i.test(
    userAgent,
  )

  if (!isCrawler) return context.next()

  const sessionId = match[1]

  // Intentar obtener título de la sesión
  let title = 'Sesión de Entrenamiento'
  let description = 'Abrí el link para ver las jugadas animadas de esta sesión de entrenamiento.'
  try {
    const apiUrl = new URL(`/.netlify/functions/api/sessions/${sessionId}`, url.origin)
    const res = await fetch(apiUrl.toString())
    if (res.ok) {
      const session = await res.json()
      title = session.title ?? title
      if (session.description) description = session.description
      const playCount = session.plays?.length ?? 0
      if (playCount > 0) {
        description += ` ${playCount} jugada${playCount !== 1 ? 's' : ''}.`
      }
    }
  } catch {
    // Usar valores genéricos
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(url.toString())}">
</head>
<body></body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const config = { path: '/s/*' }
