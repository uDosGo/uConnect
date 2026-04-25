import React, { useState, useEffect } from 'react';
import { getSystemStatus } from '../mcpClient';

const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getSystemStatus();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch system status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) return <div>Loading system status...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>ThinUI Dashboard</h1>
      <h2>System Status</h2>
      {status && (
        <pre>{JSON.stringify(status, null, 2)}</pre>
      )}
    </div>
  );
};

export default Dashboard;
