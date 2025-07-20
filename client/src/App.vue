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
        <v-row justify="center" align="center" class="mt-4">
          <v-col cols="12" md="8">
            <v-card>
              <v-card-title>Database Actions</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col>
                    <v-btn
                      color="success"
                      block
                      :loading="loading"
                      @click="loadExampleData"
                      :disabled="hasCards"
                    >
                      Load Example Cards
                      <v-icon end icon="mdi-database-plus"></v-icon>
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn
                      color="error"
                      block
                      :loading="loading"
                      @click="clearDatabase"
                      :disabled="!hasCards"
                    >
                      Clear Database
                      <v-icon end icon="mdi-database-remove"></v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-text v-if="cards.length > 0">
                <div class="text-subtitle-1 mb-2">Current Database Contents:</div>
                <v-list>
                  <v-list-item
                    v-for="card in cards"
                    :key="card.id"
                    :title="card.name"
                    :subtitle="card.set"
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-cards"></v-icon>
                    </template>
                    <template v-slot:append>
                      <v-chip size="small">{{ card.condition }}</v-chip>
                      <v-chip size="small" class="ml-2">Qty: {{ card.quantity }}</v-chip>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
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

    return {
      theme: theme.global.name,
      toggleTheme,
      loading,
      cards,
      hasCards,
      loadExampleData,
      clearDatabase
    }
  }
})
</script>

<style>
/* Global styles can be added here */
</style>
