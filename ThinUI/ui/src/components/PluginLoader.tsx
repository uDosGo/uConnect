import React, { useState, useEffect } from 'react';
import { listRegistry } from '../mcpClient';

interface Plugin {
  id: string;
  name: string;
  url: string;
  description?: string;
}

const PluginLoader: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadPlugins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call MCP tool to get plugins
      const data = await listRegistry();
      
      if (Array.isArray(data)) {
        setPlugins(data);
      } else {
        setError('Failed to load plugins: invalid data format');
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPlugins();
  }, []);
  
  if (loading) {
    return <div>Loading plugins...</div>;
  }
  
  if (error) {
    return (
      <div className="plugin-loader">
        <h2>Plugins</h2>
        <div className="error">⚠️ {error}</div>
        <button onClick={loadPlugins}>Retry</button>
      </div>
    );
  }
  
  return (
    <div className="plugin-loader">
      <h2>Plugins</h2>
      {plugins.length === 0 ? (
        <div className="no-plugins">No plugins found</div>
      ) : (
        <div className="plugin-list">
          {plugins.map(plugin => (
            <div key={plugin.id} className="plugin-card">
              <h3>{plugin.name}</h3>
              {plugin.description && <p>{plugin.description}</p>}
              <iframe
                src={plugin.url}
                title={plugin.name}
                width="100%"
                height="400px"
                frameBorder="0"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PluginLoader;
