// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  css: [
    "vuetify/styles",
    "@mdi/font/css/materialdesignicons.css",
  ],
  build: {
    transpile: [
      "vuetify"
    ],
  },
  typescript: {
    strict: true,
  }
})
