/* ═══════════════════════════════════════════════════════════════════
   code3ui — React Entry Point
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@usx/styles'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
