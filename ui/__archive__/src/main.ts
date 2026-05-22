import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Import Tailwind CSS
import './assets/tailwind.css'

// Import UDOUI CSS framework
import './assets/udoui.css'

// Import UDOUI Font Pack
import './assets/udoui-fonts.css'

// Import UDOUI Typography System
import './assets/udoui-typography.css'

// Import USX Font Token System
import './assets/usx-font-tokens.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
