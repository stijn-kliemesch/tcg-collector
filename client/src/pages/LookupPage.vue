<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
const loading = ref(false)

// Placeholder function for future implementation
const searchCards = () => {
  loading.value = true
  // Simulate API call
  setTimeout(() => {
    loading.value = false
  }, 1000)
}
</script>

<template>
  <v-container class="mt-4">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Card Lookup</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="searchCards">
              <v-text-field
                v-model="searchQuery"
                label="Search for a card"
                prepend-icon="mdi-magnify"
                clearable
                :loading="loading"
              >
                <template v-slot:append>
                  <v-btn
                    color="primary"
                    :loading="loading"
                    :disabled="!searchQuery"
                    @click="searchCards"
                  >
                    Search
                  </v-btn>
                </template>
              </v-text-field>
            </v-form>

            <v-divider class="my-4"></v-divider>

            <v-list lines="two">
              <v-list-subheader>Coming Soon</v-list-subheader>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-database-search" color="primary"></v-icon>
                </template>
                <v-list-item-title>Comprehensive Database</v-list-item-title>
                <v-list-item-subtitle>Search across multiple TCG databases</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-image-search" color="primary"></v-icon>
                </template>
                <v-list-item-title>Image Recognition</v-list-item-title>
                <v-list-item-subtitle>Search by uploading card images</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-format-list-text" color="primary"></v-icon>
                </template>
                <v-list-item-title>Detailed Information</v-list-item-title>
                <v-list-item-subtitle>Card details, rulings, and price history</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-compare" color="primary"></v-icon>
                </template>
                <v-list-item-title>Card Comparison</v-list-item-title>
                <v-list-item-subtitle>Compare different versions and printings</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
