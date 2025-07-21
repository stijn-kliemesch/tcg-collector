<template>
  <v-card>
    <v-card-title>Settings</v-card-title>
    <v-card-text>
      <p class="text-h6 mb-4">Color Theme</p>
      <v-radio-group v-model="selectedPalette" @change="handleChange">
        <p class="text-subtitle-2 mb-4">Standard Themes</p>
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

        <v-divider class="my-4"></v-divider>
        <p class="text-subtitle-2 mb-4">Colorblind-Friendly Themes</p>

        <v-radio
          label="High Contrast"
          value="highContrast"
          color="primary"
        >
          <template v-slot:label>
            <div>
              High Contrast
              <v-chip size="x-small" color="primary" class="ml-2">Colorblind Friendly</v-chip>
              <div class="d-flex gap-2 mt-1">
                <v-chip size="small" color="#0077C2">Primary</v-chip>
                <v-chip size="small" color="#424242">Secondary</v-chip>
                <v-chip size="small" color="#FF8800">Accent</v-chip>
              </div>
            </div>
          </template>
        </v-radio>

        <v-radio
          label="Safe Distinction"
          value="safeDistinction"
          color="primary"
        >
          <template v-slot:label>
            <div>
              Safe Distinction
              <v-chip size="x-small" color="primary" class="ml-2">Colorblind Friendly</v-chip>
              <div class="d-flex gap-2 mt-1">
                <v-chip size="small" color="#006BA6">Primary</v-chip>
                <v-chip size="small" color="#595959">Secondary</v-chip>
                <v-chip size="small" color="#FF8C00">Accent</v-chip>
              </div>
            </div>
          </template>
        </v-radio>

        <v-radio
          label="Universal"
          value="universal"
          color="primary"
        >
          <template v-slot:label>
            <div>
              Universal
              <v-chip size="x-small" color="primary" class="ml-2">Colorblind Friendly</v-chip>
              <div class="d-flex gap-2 mt-1">
                <v-chip size="small" color="#2E5C8A">Primary</v-chip>
                <v-chip size="small" color="#4F4F4F">Secondary</v-chip>
                <v-chip size="small" color="#D55E00">Accent</v-chip>
              </div>
            </div>
          </template>
        </v-radio>
      </v-radio-group>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useTheme } from 'vuetify'

type PaletteType = 'professional' | 'premium' | 'clean' | 'highContrast' | 'safeDistinction' | 'universal'

interface Palette {
  primary: string
  secondary: string
  accent: string
  isColorblindFriendly?: boolean
}

export default defineComponent({
  name: 'SettingsTheme',
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const theme = useTheme()

    const selectedPalette = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

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
      },
      highContrast: {
        primary: '#0077C2',
        secondary: '#424242',
        accent: '#FF8800',
        isColorblindFriendly: true
      },
      safeDistinction: {
        primary: '#006BA6',
        secondary: '#595959',
        accent: '#FF8C00',
        isColorblindFriendly: true
      },
      universal: {
        primary: '#2E5C8A',
        secondary: '#4F4F4F',
        accent: '#D55E00',
        isColorblindFriendly: true
      }
    }

    const handleChange = (value: string) => {
      const colors = palettes[value as PaletteType]
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

    return {
      selectedPalette,
      handleChange
    }
  }
})
</script>
