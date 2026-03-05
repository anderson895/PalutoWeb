import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'palutoDark',
    themes: {
      palutoDark: {
        dark: true,
        colors: {
          background: '#0a0a0a',
          surface: '#141414',
          'surface-variant': '#1a1a1a',
          primary: '#e8462a',
          'primary-darken-1': '#c93820',
          secondary: '#d4a843',
          accent: '#ff6b47',
          error: '#e8462a',
          warning: '#d4a843',
          info: '#6c6cff',
          success: '#2ecc71',
          'on-background': '#f5f0e8',
          'on-surface': '#f5f0e8',
        }
      }
    }
  },
  defaults: {
    VBtn: { rounded: 'lg', variant: 'flat' },
    VCard: { rounded: 'xl' },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VChip: { rounded: 'lg' }
  }
})
