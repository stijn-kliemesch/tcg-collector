<template>
  <v-app>
    <v-layout>
      <app-navigation
        v-model="drawer"
        :current-page="currentPage"
        @update:current-page="currentPage = $event"
      />

      <v-app-bar color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
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
        <!-- Collection Page -->
        <div v-if="currentPage === 'collection'">
          <v-row justify="center" align="center" class="mt-4">
            <v-col cols="12">
              <v-card>
                <v-card-title>My Collection</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col>
                      <v-btn
                        color="primary"
                        :loading="loading"
                        @click="loadExampleData"
                        :disabled="hasCards"
                      >
                        Load Example Cards
                        <v-icon end icon="mdi-database-plus"></v-icon>
                      </v-btn>
                      <v-btn
                        color="accent"
                        class="ml-2"
                        :loading="loading"
                        @click="clearDatabase"
                        :disabled="!hasCards"
                      >
                        Clear Database
                        <v-icon end icon="mdi-database-remove"></v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row v-if="cards.length > 0">
                    <v-col>
                      <v-data-table
                        :headers="[
                          { title: 'Name', key: 'name' },
                          { title: 'Set', key: 'set' },
                          { title: 'Condition', key: 'condition' },
                          { title: 'Quantity', key: 'quantity' }
                        ]"
                        :items="cards"
                        :items-per-page="10"
                      ></v-data-table>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Market Page -->
        <div v-else-if="currentPage === 'market'">
          <v-row justify="center" align="center" class="mt-4">
            <v-col cols="12">
              <v-card>
                <v-card-title>Market</v-card-title>
                <v-card-text>
                  <p class="text-h6">Coming Soon!</p>
                  <p>Trade and sell cards with other collectors.</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Lookup Page -->
        <div v-else-if="currentPage === 'lookup'">
          <v-row justify="center" align="center" class="mt-4">
            <v-col cols="12">
              <v-card>
                <v-card-title>Card Lookup</v-card-title>
                <v-card-text>
                  <p class="text-h6">Coming Soon!</p>
                  <p>Search and view detailed card information.</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Sets Page -->
        <div v-else-if="currentPage === 'sets'">
          <v-row justify="center" align="center" class="mt-4">
            <v-col cols="12">
              <v-card>
                <v-card-title>Card Sets</v-card-title>
                <v-card-text>
                  <p class="text-h6">Coming Soon!</p>
                  <p>Browse and manage card sets.</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- About Page -->
        <div v-else-if="currentPage === 'about'">
          <v-row justify="center" align="center" class="mt-4">
            <v-col cols="12">
              <v-card>
                <v-card-title>About TCG Collector</v-card-title>
                <v-card-text>
                  <p class="text-h6">Trading Card Game Collection Manager</p>
                  <p class="mt-4">A modern web application for managing your trading card collection.</p>
                  <p class="mt-4">Features:</p>
                  <ul class="ml-4">
                    <li>Track your card collection</li>
                    <li>Monitor market prices</li>
                    <li>Look up card information</li>
                    <li>Manage card sets</li>
                  </ul>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Settings Page -->
        <div v-else-if="currentPage === 'settings'">
          <v-row justify="center" align="center" class="mt-4">
            <v-col cols="12">
              <settings-theme v-model="selectedPalette" />
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>
    </v-layout>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import AppNavigation from '@/components/AppNavigation.vue'
import SettingsTheme from '@/components/SettingsTheme.vue'
import { palettes, defaultPalette } from '@/config/palettes'

interface Card {
  id: string
  name: string
  set: string
  condition: string
  quantity: number
  tags: string[]
  notes?: string
  dateAdded: string
}

const API_URL = import.meta.env.VITE_API_URL

export default defineComponent({
  name: 'App',
  components: {
    AppNavigation,
    SettingsTheme
  },
  setup() {
    const theme = useTheme()
    const loading = ref(false)
    const cards = ref<Card[]>([])
    const hasCards = ref(false)
    const drawer = ref(false)
    const currentPage = ref('collection') // Default to collection page
    const selectedPalette = ref(defaultPalette) // Default palette

    const loadCards = async () => {
      try {
        const response = await fetch(`${API_URL}/cards`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        })
        const data = await response.json()
        cards.value = data
        hasCards.value = data.length > 0
      } catch (error) {
        console.error('Error fetching cards:', error)
      }
    }

    const loadExampleData = async () => {
      loading.value = true
      try {
        const response = await fetch(`${API_URL}/cards/load-example`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        })
        const data = await response.json()
        cards.value = data
        hasCards.value = true
      } catch (error) {
        console.error('Error loading example data:', error)
      } finally {
        loading.value = false
      }
    }

    const clearDatabase = async () => {
      loading.value = true
      try {
        await fetch(`${API_URL}/cards`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        })
        cards.value = []
        hasCards.value = false
      } catch (error) {
        console.error('Error clearing database:', error)
      } finally {
        loading.value = false
      }
    }

    const toggleTheme = () => {
      theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    }

    // Load cards and apply initial theme on mount
    onMounted(async () => {
      // Load cards
      await loadCards()
      
      // Apply initial theme
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

    return {
      theme: theme.global.name,
      toggleTheme,
      loading,
      cards,
      hasCards,
      loadExampleData,
      clearDatabase,
      drawer,
      currentPage,
      selectedPalette
    }
  }
})
</script>

<style>
/* Global styles can be added here */
</style>
