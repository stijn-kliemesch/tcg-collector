<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title>TCG Collector</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn
        icon
        @click="toggleTheme"
        :title="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
      >
        <v-icon>
          {{ theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
        </v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <!-- Add your components here -->
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useTheme } from 'vuetify'

export default defineComponent({
  name: 'App',
  setup() {
    const theme = useTheme()

    const toggleTheme = () => {
      theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    }

    return {
      theme: theme.global.name,
      toggleTheme
    }
  }
})
</script>

<style>
/* Global styles can be added here */
</style>
