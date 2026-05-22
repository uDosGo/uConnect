/* ═══════════════════════════════════════════════════════════════════
   SnackbarServiceMonitor — React component
   Monitors Snackbar services and displays status.
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react'

interface ServiceStatus {
  name: string
  status: 'running' | 'stopped' | 'error'
  port?: number
}

const SnackbarServiceMonitor: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Snackbar', status: 'running', port: 5175 },
    { name: 'Vault', status: 'running', port: 5176 },
    { name: 'GitHub', status: 'stopped' },
    { name: 'WordPress', status: 'stopped' },
  ])

  useEffect(() => {
    const checkServices = async () => {
      const updated = await Promise.all(
        services.map(async (svc) => {
          if (!svc.port) return svc
          try {
            const res = await fetch(`http://localhost:${svc.port}/health`, {
              signal: AbortSignal.timeout(2000),
            })
            return { ...svc, status: res.ok ? 'running' as const : 'error' as const }
          } catch {
            return { ...svc, status: 'stopped' as const }
          }
        })
      )
      setServices(updated)
    }

    const interval = setInterval(checkServices, 15000)
    checkServices()
    return () => clearInterval(interval)
  }, [])

  const statusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="proseui-services">
      <h4 className="proseui-services-label">Services</h4>
      {services.map(svc => (
        <div key={svc.name} className="proseui-services-item">
          <span className={`proseui-services-dot ${svc.status}`} />
          <span className="proseui-services-name">{svc.name}</span>
          {svc.port && <span className="proseui-services-port">:{svc.port}</span>}
        </div>
      ))}
    </div>
  )
}

export default SnackbarServiceMonitor
