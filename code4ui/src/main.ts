import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// USX Design System — shared M3 tokens, palettes, and components
import '@usx/styles'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
