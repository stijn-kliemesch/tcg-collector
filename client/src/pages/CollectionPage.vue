<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Card } from '@/types/card';
import CardGrid from '@/components/CardGrid.vue';
import {
  fetchCards,
  loadExampleCards,
  clearCards,
} from '@/services/cardService';

const loading = ref(false);
const cards = ref<Card[]>([]);
const hasCards = ref(false);

const loadCards = async () => {
  try {
    const data = await fetchCards();
    cards.value = data;
    hasCards.value = data.length > 0;
  } catch (error) {
    console.error('Error fetching cards:', error);
  }
};

const loadExampleData = async () => {
  loading.value = true;
  try {
    const data = await loadExampleCards();
    cards.value = data;
    hasCards.value = true;
  } catch (error) {
    console.error('Error loading example data:', error);
  } finally {
    loading.value = false;
  }
};

const clearDatabase = async () => {
  loading.value = true;
  try {
    await clearCards();
    cards.value = [];
    hasCards.value = false;
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    loading.value = false;
  }
};

// Load cards on mount
onMounted(async () => {
  await loadCards();
});
</script>

<template>
  <v-row justify="center" align="center" class="mt-4">
    <v-col cols="12">
      <card-grid
        :cards="cards"
        :loading="loading"
        :has-cards="hasCards"
        @load-example="loadExampleData"
        @clear="clearDatabase"
      />
    </v-col>
  </v-row>
</template>
