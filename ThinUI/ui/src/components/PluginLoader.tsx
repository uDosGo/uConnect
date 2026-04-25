import React, { useState, useEffect } from 'react';

interface Plugin {
  id: string;
  name: string;
  url: string;
}

const PluginLoader: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load plugins from local JSON (temporary)
    const loadPlugins = async () => {
      try {
        // In a real implementation, this would call the MCP server
        // For now, we'll use a mock
        const mockPlugins: Plugin[] = [
          { id: '1', name: 'GitHub Blocks', url: 'https://blocks.githubnext.com' },
          { id: '2', name: 'Spark Preview', url: 'https://spark.githubnext.com' },
        ];
        setPlugins(mockPlugins);
      } catch (error) {
        console.error('Failed to load plugins:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlugins();
  }, []);
  
  if (loading) {
    return <div>Loading plugins...</div>;
  }
  
  return (
    <div className="plugin-loader">
      <h2>Plugins</h2>
      <div className="plugin-list">
        {plugins.map(plugin => (
          <div key={plugin.id} className="plugin-card">
            <h3>{plugin.name}</h3>
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
    </div>
  );
};

export default PluginLoader;
