import type { Plugin } from 'vite'

type Recent = { t: number; url: string; kind: string }

const recent: Recent[] = []
const counts = { wellKnown: 0, api: 0, page: 0, hmr: 0, asset: 0, other: 0 }
const seenSockets = new WeakSet<object>()
let rejectionHooked = false

function kindOf(url: string) {
  if (url.includes('.well-known')) return 'wellKnown'
  if (url.includes('/api/')) return 'api'
  if (url.includes('__vite') || url.includes('hmr') || url.includes('@vite') || url.includes('nuxt-devtools')) return 'hmr'
  if (url.startsWith('/_nuxt/')) return 'asset'
  if (url === '/' || (!url.includes('.') && !url.startsWith('/_nuxt'))) return 'page'
  return 'other'
}

function pushRecent(url: string) {
  const kind = kindOf(url.split('?')[0] || url)
  counts[kind] += 1
  recent.push({ t: Date.now(), url: url.slice(0, 180), kind })
  if (recent.length > 25) recent.shift()
  return kind
}

function send(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
  // #region agent log
  fetch('http://127.0.0.1:7662/ingest/c5a05403-776c-49a2-a824-e32f15757691', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '266990' }, body: JSON.stringify({ sessionId: '266990', runId: 'pre-fix', hypothesisId, location, message, data, timestamp: Date.now() }) }).catch(() => {})
  // #endregion
}

function errInfo(err: unknown) {
  const e = err as { code?: string; message?: string; syscall?: string; errno?: number; name?: string }
  return {
    code: e?.code,
    message: String(e?.message || err).slice(0, 200),
    syscall: e?.syscall,
    errno: e?.errno,
    name: e?.name,
  }
}

export function debugEconnPlugin(): Plugin {
  return {
    name: 'debug-econnreset',
    configureServer(server) {
      if (!rejectionHooked) {
        rejectionHooked = true
        process.on('unhandledRejection', (reason) => {
          const info = errInfo(reason)
          if (info.code !== 'ECONNRESET' && !info.message.includes('ECONNRESET')) return
          send('RESET', 'debug-econn-plugin.ts:unhandledRejection', 'unhandled ECONNRESET', {
            ...info,
            counts: { ...counts },
            recent: recent.slice(-12),
          })
        })
      }

      server.httpServer?.on('clientError', (err, socket) => {
        send('E', 'debug-econn-plugin.ts:clientError', 'http clientError', {
          ...errInfo(err),
          remote: (socket as { remoteAddress?: string }).remoteAddress,
          counts: { ...counts },
          recent: recent.slice(-8),
        })
      })

      server.ws?.on?.('error', (err: unknown) => {
        send('B', 'debug-econn-plugin.ts:ws-error', 'vite ws error', errInfo(err))
      })

      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        const kind = pushRecent(url)
        const started = Date.now()
        if (kind === 'wellKnown' && counts.wellKnown <= 3) {
          send('A', 'debug-econn-plugin.ts:request', 'devtools well-known request', { url: url.slice(0, 180), count: counts.wellKnown })
        }
        if (kind === 'api') {
          send('C', 'debug-econn-plugin.ts:request', 'api request start', { url: url.slice(0, 180) })
        }

        const socket = req.socket
        if (socket && !seenSockets.has(socket)) {
          seenSockets.add(socket)
          socket.on('error', (err: unknown) => {
            const info = errInfo(err)
            const hypothesisId = info.code === 'ECONNRESET'
              ? (kind === 'wellKnown' ? 'A' : kind === 'hmr' ? 'B' : kind === 'api' ? 'C' : kind === 'asset' ? 'D' : 'E')
              : 'E'
            send(hypothesisId, 'debug-econn-plugin.ts:socket-error', 'request socket error', {
              ...info,
              url: url.slice(0, 180),
              kind,
              counts: { ...counts },
            })
          })
        }

        res.on('close', () => {
          if (res.writableEnded) {
            if (kind === 'api' || kind === 'page') {
              send(kind === 'api' ? 'C' : 'E', 'debug-econn-plugin.ts:response', 'response finished', {
                url: url.slice(0, 180),
                kind,
                status: res.statusCode,
                ms: Date.now() - started,
              })
            }
            return
          }
          if (kind === 'asset') return
          send(kind === 'wellKnown' ? 'A' : kind === 'hmr' ? 'B' : kind === 'api' ? 'C' : 'E', 'debug-econn-plugin.ts:aborted', 'response closed before end', {
            url: url.slice(0, 180),
            kind,
            status: res.statusCode,
            ms: Date.now() - started,
          })
        })

        next()
      })
    },
  }
}
