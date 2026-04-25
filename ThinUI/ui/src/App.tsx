import { useState } from 'react'
import Dashboard from './components/Dashboard'
import PluginLoader from './components/PluginLoader'
import SystemStatus from './components/SystemStatus'
import WorkflowsPanel from './components/WorkflowsPanel'
import DataSourcesPanel from './components/DataSourcesPanel'
import SparkLauncher from './components/SparkLauncher'
import RepoMindPanel from './components/RepoMindPanel'
import './App.css'

type Tab = 'dashboard' | 'plugins' | 'status' | 'workflows' | 'data-sources' | 'spark' | 'repo-mind';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

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
        <button onClick={() => setActiveTab('workflows')} className={activeTab === 'workflows' ? 'active' : ''}>
          Workflows
        </button>
        <button onClick={() => setActiveTab('data-sources')} className={activeTab === 'data-sources' ? 'active' : ''}>
          Data Sources
        </button>
        <button onClick={() => setActiveTab('spark')} className={activeTab === 'spark' ? 'active' : ''}>
          Spark Launcher
        </button>
        <button onClick={() => setActiveTab('repo-mind')} className={activeTab === 'repo-mind' ? 'active' : ''}>
          Repo Mind
        </button>
      </nav>
      
      <main className="content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'plugins' && <PluginLoader />}
        {activeTab === 'status' && <SystemStatus />}
        {activeTab === 'workflows' && <WorkflowsPanel />}
        {activeTab === 'data-sources' && <DataSourcesPanel />}
        {activeTab === 'spark' && <SparkLauncher />}
        {activeTab === 'repo-mind' && <RepoMindPanel />}
      </main>
    </div>
  )
}

export default App
