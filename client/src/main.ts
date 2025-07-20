import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6'
        }
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#424242'
        }
      }
    }
  }
})

const app = createApp(App)
app.use(vuetify)
app.mount('#app')
