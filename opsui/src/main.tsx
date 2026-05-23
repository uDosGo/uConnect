import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// USX Design System — shared M3 tokens, palettes, and components
import '@usx/styles'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
