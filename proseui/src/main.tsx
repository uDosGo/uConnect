/* ═══════════════════════════════════════════════════════════════════
   proseui — React Entry Point
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { USXThemeProvider } from '@usx/styles/react'
import App from './App'
import '@usx/styles'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <USXThemeProvider>
        <App />
      </USXThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
