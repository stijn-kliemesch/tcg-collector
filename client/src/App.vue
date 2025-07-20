<template>
  <v-app>
    <v-navigation-drawer v-model="drawer">
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-grid"
          title="Collection"
          value="collection"
          :active="currentPage === 'collection'"
          @click="currentPage = 'collection'"
        ></v-list-item>
        
        <v-list-item
          prepend-icon="mdi-store"
          title="Market"
          value="market"
          :active="currentPage === 'market'"
          @click="currentPage = 'market'"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-magnify"
          title="Lookup"
          value="lookup"
          :active="currentPage === 'lookup'"
          @click="currentPage = 'lookup'"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-cards"
          title="Sets"
          value="sets"
          :active="currentPage === 'sets'"
          @click="currentPage = 'sets'"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-information"
          title="About"
          value="about"
          :active="currentPage === 'about'"
          @click="currentPage = 'about'"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          value="settings"
          :active="currentPage === 'settings'"
          @click="currentPage = 'settings'"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

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
              <v-card>
                <v-card-title>Settings</v-card-title>
                <v-card-text>
                  <p class="text-h6 mb-4">Color Theme</p>
                  <v-radio-group v-model="selectedPalette" @change="applyPalette">
                    <v-radio
                      label="Professional & Modern"
                      value="professional"
                      color="primary"
                    >
                      <template v-slot:label>
                        <div>
                          Professional & Modern
                          <div class="d-flex gap-2 mt-1">
                            <v-chip size="small" color="#1976D2">Primary</v-chip>
                            <v-chip size="small" color="#424242">Secondary</v-chip>
                            <v-chip size="small" color="#FFC107">Accent</v-chip>
                          </div>
                        </div>
                      </template>
                    </v-radio>
                    
                    <v-radio
                      label="Collector's Premium"
                      value="premium"
                      color="primary"
                    >
                      <template v-slot:label>
                        <div>
                          Collector's Premium
                          <div class="d-flex gap-2 mt-1">
                            <v-chip size="small" color="#673AB7">Primary</v-chip>
                            <v-chip size="small" color="#303030">Secondary</v-chip>
                            <v-chip size="small" color="#FFD700">Accent</v-chip>
                          </div>
                        </div>
                      </template>
                    </v-radio>
                    
                    <v-radio
                      label="Clean & Accessible"
                      value="clean"
                      color="primary"
                    >
                      <template v-slot:label>
                        <div>
                          Clean & Accessible
                          <div class="d-flex gap-2 mt-1">
                            <v-chip size="small" color="#2196F3">Primary</v-chip>
                            <v-chip size="small" color="#F5F5F5">Secondary</v-chip>
                            <v-chip size="small" color="#4CAF50">Accent</v-chip>
                          </div>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'

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
  setup() {
    const theme = useTheme()
    const loading = ref(false)
    const cards = ref<Card[]>([])
    const hasCards = ref(false)
    const drawer = ref(false)
    const currentPage = ref('collection') // Default to collection page
    const selectedPalette = ref('professional') // Default palette

    type PaletteType = 'professional' | 'premium' | 'clean'
    type Palette = {
      primary: string
      secondary: string
      accent: string
    }
    
    const palettes: Record<PaletteType, Palette> = {
      professional: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#FFC107'
      },
      premium: {
        primary: '#673AB7',
        secondary: '#303030',
        accent: '#FFD700'
      },
      clean: {
        primary: '#2196F3',
        secondary: '#F5F5F5',
        accent: '#4CAF50'
      }
    }

    const applyPalette = () => {
      const colors = palettes[selectedPalette.value as PaletteType]
      theme.themes.value.light = {
        ...theme.themes.value.light,
        colors: {
          ...theme.themes.value.light.colors,
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent
        }
      }
      theme.themes.value.dark = {
        ...theme.themes.value.dark,
        colors: {
          ...theme.themes.value.dark.colors,
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent
        }
      }
    }

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

    onMounted(async () => {
      await loadCards()
    })

    // Apply default palette on mount
    onMounted(() => {
      applyPalette()
      loadCards()
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
      selectedPalette,
      applyPalette
    }
  }
})
</script>

<style>
/* Global styles can be added here */
</style>
