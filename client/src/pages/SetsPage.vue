<script setup lang="ts">
import { ref } from 'vue';

const selectedGame = ref('');
const searchQuery = ref('');

// Placeholder data for future implementation
const games = [
  'Magic: The Gathering',
  'Pokémon',
  'Yu-Gi-Oh!',
  'Flesh and Blood',
  'Dragon Ball Super',
];

const sets = ref([
  {
    name: 'Example Set 1',
    game: 'Magic: The Gathering',
    year: '2025',
    cards: 245,
    collected: 0,
    progress: 0,
  },
  {
    name: 'Example Set 2',
    game: 'Pokémon',
    year: '2025',
    cards: 180,
    collected: 0,
    progress: 0,
  },
]);
</script>

<template>
  <v-container class="mt-4">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Set Collection</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedGame"
                  :items="games"
                  label="Select Game"
                  prepend-icon="mdi-cards"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  label="Search Sets"
                  prepend-icon="mdi-magnify"
                  clearable
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <!-- Sets List -->
            <v-list lines="two">
              <template v-if="sets.length > 0">
                <v-list-item v-for="set in sets" :key="set.name">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-book" color="primary"></v-icon>
                  </template>

                  <v-list-item-title>{{ set.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ set.game }} • {{ set.year }} • {{ set.collected }}/{{
                      set.cards
                    }}
                    cards
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-progress-circular
                      :model-value="set.progress"
                      :size="32"
                      :width="3"
                      color="primary"
                    >
                      {{ set.progress }}%
                    </v-progress-circular>
                  </template>
                </v-list-item>
              </template>
            </v-list>

            <!-- Coming Soon Features -->
            <v-list lines="two">
              <v-list-subheader>Coming Soon</v-list-subheader>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-book-multiple" color="primary"></v-icon>
                </template>
                <v-list-item-title>Set Management</v-list-item-title>
                <v-list-item-subtitle
                  >Track your progress for each TCG set</v-list-item-subtitle
                >
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-chart-box" color="primary"></v-icon>
                </template>
                <v-list-item-title>Collection Analytics</v-list-item-title>
                <v-list-item-subtitle
                  >View completion stats and set value
                  estimates</v-list-item-subtitle
                >
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-checklist" color="primary"></v-icon>
                </template>
                <v-list-item-title>Checklists</v-list-item-title>
                <v-list-item-subtitle
                  >Detailed checklists for each set</v-list-item-subtitle
                >
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-bell" color="primary"></v-icon>
                </template>
                <v-list-item-title>Set Alerts</v-list-item-title>
                <v-list-item-subtitle
                  >Get notified about new sets and
                  releases</v-list-item-subtitle
                >
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
