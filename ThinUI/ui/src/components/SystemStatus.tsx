import React, { useState, useEffect } from 'react';

const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Mock system status check
    const checkStatus = async () => {
      try {
        // In a real implementation, this would call the MCP server
        const mockStatus = {
          'Vault': 'Connected',
          'MCP Server': 'Running',
          'Plugins': '2 loaded',
        };
        setStatus(mockStatus);
      } catch (error) {
        console.error('Failed to check system status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, []);
  
  if (loading) {
    return <div>Checking system status...</div>;
  }
  
  return (
    <div className="system-status">
      <h2>System Status</h2>
      <ul>
        {Object.entries(status).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SystemStatus;
