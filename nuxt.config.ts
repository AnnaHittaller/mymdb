import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  spaLoadingTemplate: true,
  modules: [
    '@nuxt/ui', 
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@formkit/auto-animate/nuxt'
  ],
  colorMode: {
    preference: 'dark',
  },
  ui: {
    icons: "all",
  },
  runtimeConfig: {
    apiKey: process.env.NUXT_API_KEY,
    apiBaseUrl: process.env.NUXT_API_BASE_URL,
    apiBearerToken: process.env.NUXT_API_BEARER_TOKEN,
    public: {
      apiKey: process.env.FIREBASE_APIKEY,
      authDomain: process.env.FIREBASE_AUTHDOMAIN,
      projectId: process.env.FIREBASE_PROJECTID,
      storageBucket: process.env.FIREBASE_STORAGEBUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
      appId: process.env.FIREBASE_APPID,
    }
  },
  ssr: false,
   vue: {  
    compilerOptions: {
      isCustomElement: (tag: string) => tag.startsWith('swiper-'),
    },
  }
})


