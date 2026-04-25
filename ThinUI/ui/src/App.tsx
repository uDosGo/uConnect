import { useState } from 'react'
import Dashboard from './components/Dashboard'
import PluginLoader from './components/PluginLoader'
import SystemStatus from './components/SystemStatus'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plugins' | 'status'>('dashboard')

  return (
    <div className="app">
      <nav className="navbar">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>
          Dashboard
        </button>
        <button onClick={() => setActiveTab('plugins')} className={activeTab === 'plugins' ? 'active' : ''}>
          Plugins
        </button>
        <button onClick={() => setActiveTab('status')} className={activeTab === 'status' ? 'active' : ''}>
          Status
        </button>
      </nav>
      
      <main className="content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'plugins' && <PluginLoader />}
        {activeTab === 'status' && <SystemStatus />}
      </main>
    </div>
  )
}

export default App
