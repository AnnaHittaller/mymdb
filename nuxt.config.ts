import { readFile } from 'node:fs/promises'
import { findExports } from 'mlly'
import { defineNuxtConfig } from 'nuxt/config'
import { glob } from 'tinyglobby'

const firebaseEmulatorsActive =
  process.env.NUXT_E2E === 'true' ||
  Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
  Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST)

const productionTrailerCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com",
  "img-src 'self' data: blob: https://image.tmdb.org https://i.ytimg.com https://*.googleusercontent.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://api.themoviedb.org https://*.googleapis.com https://*.firebaseio.com https://*.google.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
].join('; ')

export default defineNuxtConfig({
  devtools: { enabled: true },
  spaLoadingTemplate: false,

  app: {
    head: {
      style: [
        {
          key: 'shell-bg',
          innerHTML: 'html,body{background-color:#101010;color:#fafafa}',
        },
      ],
    },
  },

  srcDir: '.',

  css: ['~/assets/css/tailwind.css'],

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@formkit/auto-animate/nuxt',
    'nuxt-vuefire',
  ],

  colorMode: {
    preference: 'dark',
  },

  // Server render so a hard refresh of a gated page can read the __session cookie.
  ssr: true,

  vuefire: {
   auth: {
    enabled: true,
    // Secure httpOnly cookies do not apply cleanly on http://127.0.0.1 during local e2e.
    sessionCookie: firebaseEmulatorsActive
      ? false
      : {
          httpOnly: true,
          secure: true,
          path: '/',
          sameSite: 'lax',
        },
   },
   emulators: {
    enabled: firebaseEmulatorsActive,
    host: '127.0.0.1',
   },
   config: {
     apiKey: process.env.FIREBASE_APIKEY,
     authDomain: process.env.FIREBASE_AUTHDOMAIN,
     projectId: process.env.FIREBASE_PROJECTID,
     storageBucket: process.env.FIREBASE_STORAGEBUCKET,
     messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
     appId: process.env.FIREBASE_APPID,
   },
 },

   runtimeConfig: {
     apiKey: process.env.NUXT_API_KEY,
     apiBaseUrl: process.env.NUXT_API_BASE_URL,
     apiBearerToken: process.env.NUXT_API_BEARER_TOKEN,
     public: {},
   },
  compatibilityDate: '2026-10-25',

  routeRules: process.env.NODE_ENV === 'production'
    ? {
        '/**': {
          headers: {
            'Content-Security-Policy': productionTrailerCsp,
          },
        },
      }
    : {},

  hooks: {
    async 'imports:extend'(imports) {
      const files = await glob(['composables/*.{ts,js,mjs}', 'utils/*.{ts,js,mjs}'], {
        absolute: true,
        cwd: process.cwd(),
        ignore: ['**/*.test.ts'],
      })
      const seen = new Set(imports.map((item: { from: string; name: string }) => `${item.from}:${item.name}`))
      for (const file of files) {
        const code = await readFile(file, 'utf8')
        for (const exp of findExports(code)) {
          const names = exp.type === 'declaration' && exp.name
            ? [exp.name]
            : exp.type === 'named'
              ? exp.names
              : []
          for (const name of names) {
            const key = `${file}:${name}`
            if (seen.has(key)) continue
            seen.add(key)
            imports.push({ name, as: name, from: file })
          }
        }
      }
    },
    'vite:configResolved'(config) {
      const visit = (plugin: any) => {
        if (!plugin) return
        if (Array.isArray(plugin)) {
          plugin.forEach(visit)
          return
        }
        if (plugin.name !== 'nuxt:components:imports' || typeof plugin.transformInclude !== 'function') return
        const include = plugin.transformInclude
        plugin.transformInclude = (id: string) => {
          if (id.includes('\0')) return false
          try {
            return include(id)
          } catch {
            return false
          }
        }
      }
      visit(config.plugins)
    },
  },
})
