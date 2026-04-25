import React, { useState, useEffect } from 'react';
import { runDoctor } from '../mcpClient';

const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call MCP tool to get system status
      const data = await runDoctor();
      
      if (data && typeof data === 'object') {
        setStatus(data);
      } else {
        setError('Failed to get system status: invalid data format');
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkStatus();
  }, []);
  
  if (loading) {
    return <div>Checking system status...</div>;
  }
  
  if (error) {
    return (
      <div className="system-status">
        <h2>System Status</h2>
        <div className="error">⚠️ {error}</div>
        <button onClick={checkStatus}>Retry</button>
      </div>
    );
  }
  
  return (
    <div className="system-status">
      <h2>System Status</h2>
      {Object.keys(status).length === 0 ? (
        <div className="no-status">No status information available</div>
      ) : (
        <ul>
          {Object.entries(status).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SystemStatus;
