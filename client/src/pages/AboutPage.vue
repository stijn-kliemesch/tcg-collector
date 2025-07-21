<script setup lang="ts">
import { version } from '../../../package.json'

const features = [
  {
    title: 'Collection Management',
    icon: 'mdi-view-grid',
    description: 'Keep track of your trading cards with an easy-to-use interface'
  },
  {
    title: 'Market Integration',
    icon: 'mdi-store',
    description: 'Monitor prices and find the best deals for cards'
  },
  {
    title: 'Card Lookup',
    icon: 'mdi-magnify',
    description: 'Search and view detailed information about any card'
  },
  {
    title: 'Set Tracking',
    icon: 'mdi-cards',
    description: 'Track your progress completing different card sets'
  }
]

const technologies = [
  { name: 'Vue 3', icon: 'mdi-vuejs' },
  { name: 'TypeScript', icon: 'mdi-language-typescript' },
  { name: 'Vuetify', icon: 'mdi-view-dashboard' },
  { name: 'Node.js', icon: 'mdi-nodejs' }
]
</script>

<template>
  <v-container class="mt-4">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card>
          <v-card-title class="text-center text-h4 py-4">
            TCG Collector
            <div class="text-subtitle-1 mt-1">Version {{ version }}</div>
          </v-card-title>

          <v-card-text class="text-center pb-0">
            A modern application for managing your trading card collection
          </v-card-text>

          <v-card-text>
            <v-row>
              <v-col cols="12">
                <div class="text-h6 mb-4">Key Features</div>
                <v-list lines="two">
                  <v-list-item
                    v-for="feature in features"
                    :key="feature.title"
                    :title="feature.title"
                    :subtitle="feature.description"
                  >
                    <template v-slot:prepend>
                      <v-icon :icon="feature.icon" color="primary" size="large"></v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <v-row>
              <v-col cols="12">
                <div class="text-h6 mb-4">Built With</div>
                <v-chip-group>
                  <v-chip
                    v-for="tech in technologies"
                    :key="tech.name"
                    size="large"
                    class="ma-2"
                  >
                    <v-icon start :icon="tech.icon"></v-icon>
                    {{ tech.name }}
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <v-row>
              <v-col cols="12">
                <div class="text-h6 mb-4">Links</div>
                <v-list>
                  <v-list-item
                    href="https://github.com/stijn-kliemesch/tcg-collector"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-github" color="primary"></v-icon>
                    </template>
                    <v-list-item-title>GitHub Repository</v-list-item-title>
                    <v-list-item-subtitle>View the source code</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item
                    href="https://github.com/stijn-kliemesch/tcg-collector/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-bug" color="primary"></v-icon>
                    </template>
                    <v-list-item-title>Issue Tracker</v-list-item-title>
                    <v-list-item-subtitle>Report bugs or request features</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-text class="text-center text-caption">
            © {{ new Date().getFullYear() }} TCG Collector. All rights reserved.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
