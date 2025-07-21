<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import SettingsTheme from '@/components/SettingsTheme.vue'
import { defaultPalette, type PaletteType } from '@/config/palettes'

const theme = useTheme()
const selectedPalette = ref<PaletteType>(defaultPalette)
const tab = ref('appearance')

const tabs = [
  { value: 'appearance', title: 'Appearance', icon: 'mdi-palette' },
  { value: 'collection', title: 'Collection', icon: 'mdi-cards' },
  { value: 'notifications', title: 'Notifications', icon: 'mdi-bell' },
  { value: 'advanced', title: 'Advanced', icon: 'mdi-cog' }
]
</script>

<template>
  <v-container class="mt-4">
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-list>
            <v-list-item
              v-for="item in tabs"
              :key="item.value"
              :value="item.value"
              :active="tab === item.value"
              @click="tab = item.value"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <!-- Appearance Settings -->
        <v-slide-x-transition>
          <settings-theme
            v-if="tab === 'appearance'"
            v-model="selectedPalette"
          />
        </v-slide-x-transition>

        <!-- Collection Settings -->
        <v-slide-x-transition>
          <v-card v-if="tab === 'collection'">
            <v-card-title>Collection Settings</v-card-title>
            <v-card-text>
              <v-list-subheader>Coming Soon</v-list-subheader>
              <v-list lines="two">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-format-list-checks" color="primary"></v-icon>
                  </template>
                  <v-list-item-title>Default View Options</v-list-item-title>
                  <v-list-item-subtitle>Configure how your collection is displayed</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-filter-variant" color="primary"></v-icon>
                  </template>
                  <v-list-item-title>Default Filters</v-list-item-title>
                  <v-list-item-subtitle>Set up default filtering options</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-slide-x-transition>

        <!-- Notification Settings -->
        <v-slide-x-transition>
          <v-card v-if="tab === 'notifications'">
            <v-card-title>Notification Settings</v-card-title>
            <v-card-text>
              <v-list-subheader>Coming Soon</v-list-subheader>
              <v-list lines="two">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-bell-ring" color="primary"></v-icon>
                  </template>
                  <v-list-item-title>Price Alerts</v-list-item-title>
                  <v-list-item-subtitle>Get notified about price changes</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-new-box" color="primary"></v-icon>
                  </template>
                  <v-list-item-title>New Set Alerts</v-list-item-title>
                  <v-list-item-subtitle>Stay updated about new set releases</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-slide-x-transition>

        <!-- Advanced Settings -->
        <v-slide-x-transition>
          <v-card v-if="tab === 'advanced'">
            <v-card-title>Advanced Settings</v-card-title>
            <v-card-text>
              <v-list-subheader>Coming Soon</v-list-subheader>
              <v-list lines="two">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-database" color="primary"></v-icon>
                  </template>
                  <v-list-item-title>Data Management</v-list-item-title>
                  <v-list-item-subtitle>Import, export, and backup your collection data</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-api" color="primary"></v-icon>
                  </template>
                  <v-list-item-title>API Configuration</v-list-item-title>
                  <v-list-item-subtitle>Configure external API integrations</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-slide-x-transition>
      </v-col>
    </v-row>
  </v-container>
</template>
