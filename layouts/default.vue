<template>
  <v-app-bar
    :elevation="10"
    color="blue-grey-darken-1"
    height="80"
  >
    <v-container class="fill-height d-flex align-center">
      <v-app-bar-title>
        <v-btn 
          variant="text"
          to="/"
          size="x-large"
          :active=false
          nuxt
        >
          <span class="text-h5">
            情報科学特別講義A
          </span>
        </v-btn>
      </v-app-bar-title>
    </v-container>
  </v-app-bar>

  <v-main>
    <NuxtPage />
  </v-main>
</template>

<script setup lang="ts">
</script>