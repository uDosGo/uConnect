import { useState, useEffect } from 'react'
import './App.css'

// Define types for uDosConnect surfaces
interface Surface {
  id: string
  name: string
  description: string
  component: React.ReactNode
  path: string
}

// Mock surface components (these would be replaced with actual implementations)
const VibeSurface = () => (
  <div className="surface-content">
    <h2>🎮 Vibe TUI</h2>
    <p>Interactive terminal interface for uDosConnect</p>
    <div className="terminal-mock">
      <pre>
        $ udo status
        ✅ System: Online
        🔋 Battery: 87%
        📡 Network: Connected
        
        $ udo vibe
        🎵 Now playing: Chill Lofi Beats
      </pre>
    </div>
  </div>
)

const VaultSurface = () => (
  <div className="surface-content">
    <h2>🗄️ Vault Browser</h2>
    <p>Browse and manage your knowledge vault</p>
    <div className="vault-mock">
      <div className="vault-item">📁 Projects/</div>
      <div className="vault-item">📄 README.md</div>
      <div className="vault-item">📊 analytics.json</div>
      <div className="vault-item">🔧 config.yaml</div>
    </div>
  </div>
)

const GitHubSurface = () => (
  <div className="surface-content">
    <h2>🐙 GitHub Sync</h2>
    <p>GitHub repository integration</p>
    <div className="github-mock">
      <pre>
        📥 Pulling latest changes...
        ✅ Updated 3 repositories
        🚀 Ready to deploy
      </pre>
    </div>
  </div>
)

const WordPressSurface = () => (
  <div className="surface-content">
    <h2>🌐 WordPress Adaptor</h2>
    <p>WordPress content management</p>
    <div className="wordpress-mock">
      <pre>
        📝 Latest Posts:
        - "Getting Started with uDosConnect"
        - "Advanced Workflow Automation"
        - "React Renderer Tutorial"
      </pre>
    </div>
  </div>
)

const USXDSurface = () => (
  <div className="surface-content">
    <h2>🎨 USXD Renderer</h2>
    <p>Universal Surface Experience Design</p>
    <div className="usxd-mock">
      <pre>
        🖼️  Rendering USXD components...
        ✨ Dynamic surface composition
        🎯 Adaptive layout engine
      </pre>
    </div>
  </div>
)

const WorkflowSurface = () => (
  <div className="surface-content">
    <h2>⚙️ Workflow Engine</h2>
    <p>Automate your workflows</p>
    <div className="workflow-mock">
      <pre>
        🔄 Active Workflows:
        1. Daily Backup → ✅ Completed
        2. Content Sync → 🔄 Running
        3. Analytics Report → ⏳ Pending
      </pre>
    </div>
  </div>
)

function App() {
  const [activeSurface, setActiveSurface] = useState<string>('vibe')
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['vibe'])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  
  // Available surfaces
  const surfaces: Surface[] = [
    {
      id: 'vibe',
      name: 'Vibe TUI',
      description: 'Interactive terminal interface',
      component: <VibeSurface />,
      path: '/surface/vibe'
    },
    {
      id: 'vault',
      name: 'Vault Browser',
      description: 'Knowledge vault management',
      component: <VaultSurface />,
      path: '/surface/vault'
    },
    {
      id: 'github',
      name: 'GitHub Sync',
      description: 'Repository integration',
      component: <GitHubSurface />,
      path: '/surface/github'
    },
    {
      id: 'wordpress',
      name: 'WordPress Adaptor',
      description: 'Content management',
      component: <WordPressSurface />,
      path: '/surface/wordpress'
    },
    {
      id: 'usxd',
      name: 'USXD Renderer',
      description: 'Universal Surface Design',
      component: <USXDSurface />,
      path: '/surface/usxd'
    },
    {
      id: 'workflow',
      name: 'Workflow Engine',
      description: 'Automation workflows',
      component: <WorkflowSurface />,
      path: '/surface/workflow'
    }
  ]
  
  const navigateTo = (surfaceId: string) => {
    const newHistory = [...navigationHistory.slice(0, currentIndex + 1), surfaceId]
    setNavigationHistory(newHistory)
    setCurrentIndex(newHistory.length - 1)
    setActiveSurface(surfaceId)
  }
  
  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setActiveSurface(navigationHistory[newIndex])
    }
  }
  
  const goForward = () => {
    if (currentIndex < navigationHistory.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setActiveSurface(navigationHistory[newIndex])
    }
  }
  
  const refresh = () => {
    // Refresh the current surface
    setActiveSurface(navigationHistory[currentIndex])
  }
  
  const activeSurfaceData = surfaces.find(s => s.id === activeSurface) || surfaces[0]
  
  return (
    <div className="udos-react-renderer">
      {/* Header with navigation controls */}
      <header className="renderer-header">
        <div className="header-left">
          <h1 className="renderer-title">🚀 uDosConnect React Renderer</h1>
          <div className="breadcrumb">
            {navigationHistory.slice(0, currentIndex + 1).map((surfaceId, index) => (
              <span key={index}>
                {index > 0 && ' > '}
                <button 
                  onClick={() => navigateTo(surfaceId)}
                  className="breadcrumb-item"
                >
                  {surfaces.find(s => s.id === surfaceId)?.name || surfaceId}
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="header-right">
          <div className="renderer-controls">
            <button 
              onClick={goBack} 
              disabled={currentIndex <= 0}
              className="control-btn"
              title="Go back"
            >
              ←
            </button>
            <button 
              onClick={goForward}
              disabled={currentIndex >= navigationHistory.length - 1}
              className="control-btn"
              title="Go forward"
            >
              →
            </button>
            <button 
              onClick={refresh}
              className="control-btn"
              title="Refresh"
            >
              🔄
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="renderer-main">
        <div className="surface-container">
          {activeSurfaceData.component}
        </div>
      </main>
      
      {/* Surface navigation sidebar */}
      <aside className="surface-sidebar">
        <h3 className="sidebar-title">📱 Surfaces</h3>
        <div className="surface-list">
          {surfaces.map((surface) => (
            <button
              key={surface.id}
              onClick={() => navigateTo(surface.id)}
              className={`surface-btn ${activeSurface === surface.id ? 'active' : ''}`}
              title={surface.description}
            >
              {surface.name}
            </button>
          ))}
        </div>
      </aside>
      
      {/* Status bar */}
      <footer className="renderer-status">
        <div className="status-left">
          <span className="status-item">✅ Connected</span>
          <span className="status-item">🔋 87%</span>
          <span className="status-item">📡 Online</span>
        </div>
        <div className="status-right">
          <span className="status-item">React Renderer v1.0</span>
          <span className="status-item">uDosConnect Core</span>
        </div>
      </footer>
    </div>
  )
}

export default App