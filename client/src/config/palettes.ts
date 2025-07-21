type PaletteType = 'professional' | 'premium' | 'clean' | 'highContrast' | 'safeDistinction' | 'universal'

interface Palette {
  primary: string
  secondary: string
  accent: string
  isColorblindFriendly?: boolean
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

const defaultPalette = 'professional' as const

export { type PaletteType, type Palette, palettes, defaultPalette }
