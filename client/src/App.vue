<template>
  <v-app>
    <v-layout>
      <app-navigation v-model="drawer" />

      <v-app-bar color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>TCG Collector</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn
        icon
        @click="toggleTheme"
        :title="theme.global.name.value === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
      >
        <v-icon>
          {{ theme.global.name.value === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
        </v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import AppNavigation from '@/components/AppNavigation.vue'
import { palettes, defaultPalette } from '@/config/palettes'

const theme = useTheme()
const drawer = ref(false)
const selectedPalette = ref(defaultPalette)

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

// Apply initial theme on mount
onMounted(() => {
  const defaultColors = palettes[defaultPalette]
  theme.themes.value.light = {
    ...theme.themes.value.light,
    colors: {
      ...theme.themes.value.light.colors,
      primary: defaultColors.primary,
      secondary: defaultColors.secondary,
      accent: defaultColors.accent
    }
  }
  theme.themes.value.dark = {
    ...theme.themes.value.dark,
    colors: {
      ...theme.themes.value.dark.colors,
      primary: defaultColors.primary,
      secondary: defaultColors.secondary,
      accent: defaultColors.accent
    }
  }
})
</script>

<style>
/* Global styles can be added here */
</style>
