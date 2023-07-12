<template>
  <v-app-bar
    app
    :elevation="10"
    color="blue-grey-darken-1"
    scroll-behavior="collapse"
    scroll-threshold="100"
  >
    <v-toolbar-title>情報科学特別講義</v-toolbar-title>
  </v-app-bar>

  <v-main>
    <NuxtPage />
  </v-main>
</template>