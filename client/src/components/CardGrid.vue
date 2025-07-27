<template>
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
              { title: 'Quantity', key: 'quantity' },
            ]"
            :items="cards"
            :items-per-page="10"
          ></v-data-table>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Card } from '@/types/card';

export default defineComponent({
  name: 'CardGrid',
  props: {
    cards: {
      type: Array as () => Card[],
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    hasCards: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['load-example', 'clear'],
  setup(props, { emit }) {
    return {
      loadExampleData: () => emit('load-example'),
      clearDatabase: () => emit('clear'),
    };
  },
});
</script>
