// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
//import { resolve } from 'path'
export default defineNuxtConfig({
  devtools: { enabled: true },
  // alias: {
  //   '@': resolve(__dirname, "/")
  // },
  modules: [
    '@nuxt/ui', 
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],
  colorMode: {
    preference: 'system',
    //fallback: 'dark'
  },
  ui: {
    icons: "all",
  }
})


