// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: "/topic-in-cs-a/",
    cdnURL: "https://sugitamotoki.github.io/topic-in-cs-a/"
  },
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
    tsConfig: {
      "allowUnreachableCode": false,
      "allowUnusedLabels": false,
      "alwaysStrict": true,
      "exactOptionalPropertyTypes": true,
      "noFallthroughCasesInSwitch": true,
      "noImplicitAny": true,
      "noImplicitOverride": true,
      "noImplicitReturns": true,
      "noImplicitThis": true,
      "noPropertyAccessFromIndexSignature": true,
      "noUncheckedIndexedAccess": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "strict": true,
      "strictBindCallApply": true,
      "strictFunctionTypes": true,
      "strictNullChecks": true,
      "strictPropertyInitialization": true,
      "useUnknownInCatchVariables": true,
    }
  }
})
