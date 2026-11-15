import { readFile } from 'node:fs/promises'
import { findExports } from 'mlly'
import { defineNuxtConfig } from 'nuxt/config'
import { glob } from 'tinyglobby'
import { APP_LOCALE_COOKIE } from './domain/locale/appLocale'

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
  "worker-src 'self'",
  "connect-src 'self' https://api.themoviedb.org https://*.googleapis.com https://*.firebaseio.com https://*.google.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
].join('; ')

const pwaManifest = {
  name: 'MyMDb',
  short_name: 'MyMDb',
  description: 'Keep your movie and show must-watch list always up-to-date.',
  id: '/',
  start_url: '/',
  scope: '/',
  display: 'standalone' as const,
  orientation: 'portrait' as const,
  theme_color: '#101010',
  background_color: '#101010',
  categories: ['entertainment', 'lifestyle'],
  icons: [
    {
      src: 'pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
}

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
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'theme-color', content: '#101010' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'MyMDb' },
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
    'nuxt-simple-cookie-consent',
    '@vite-pwa/nuxt',
    '@nuxtjs/i18n',
  ],

  pwa: {
    registerType: 'prompt',
    manifest: pwaManifest,
    generateSW: {
      globPatterns: ['**/*.{js,css,woff2,png,ico,svg}'],
      // Do not ignore `**/*.json`: @vite-pwa/nuxt precaches `_nuxt/builds/**/*.json` (app manifest).
      globIgnores: ['**/*.html', '**/server/**'],
      globStrict: false,
      navigateFallback: undefined,
      navigateFallbackDenylist: [/^\/api\//],
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/_nuxt_icon'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'mymdb-nuxt-icons',
            expiration: {
              maxEntries: 256,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
          handler: 'NetworkOnly',
        },
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'mymdb-html',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 60 * 60 * 24,
            },
          },
        },
      ],
    },
    client: {
      registerPlugin: true,
      installPrompt: 'mymdb_pwa_install_dismissed',
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  cookieConsent: {
    cookieName: 'mymdb_consent',
    expiresInDays: 180,
    consentVersion: '1.0.0',
    categories: {
      embeddedVideo: {
        label: 'Embedded video',
        description: 'Loads a YouTube or Vimeo trailer after you allow it.',
        required: false,
      },
    },
    scripts: [],
  },

  colorMode: {
    preference: 'dark',
  },

  icon: {
    serverBundle: {
      collections: ['fe', 'fluent-emoji-flat', 'heroicons', 'streamline-memes'],
    },
    clientBundle: {
      scan: true,
      // Full heroicons scan can exceed the default 256 KB; app is PWA-offline-first for UI chrome.
      sizeLimitKb: 768,
    },
    provider: {
      server: 'server',
      client: 'server',
    },
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

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    langDir: 'locales',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', files: ['en.json'] },
      { code: 'de', language: 'de-DE', name: 'Deutsch', files: ['de.json'] },
      { code: 'hu', language: 'hu-HU', name: 'Magyar', files: ['hu.json'] },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: APP_LOCALE_COOKIE,
      fallbackLocale: 'en',
    },
    bundle: {
      fullInstall: true,
    },
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
