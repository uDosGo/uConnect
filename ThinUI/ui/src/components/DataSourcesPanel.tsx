import React, { useState } from 'react';
import { scheduleFlatData } from '../mcpClient';

const DataSourcesPanel: React.FC = () => {
  const [source, setSource] = useState('');
  const [schedule, setSchedule] = useState('0 0 * * *'); // Default: daily at midnight
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await scheduleFlatData(source, schedule);
      setResult({
        success: true,
        message: 'Data source scheduled successfully!',
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-sources-panel">
      <h2>Schedule Flat Data</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="source">Data Source URL:</label>
          <input
            type="url"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="https://example.com/data.json"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="schedule">Schedule (Cron):</label>
          <input
            type="text"
            id="schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="0 0 * * * (daily at midnight)"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Scheduling...' : 'Schedule Data Source'}
        </button>

        {result && (
          <div className={result.success ? 'success' : 'error'}>
            {result.success ? '✅' : '❌'} {result.message || result.error}
          </div>
        )}
      </form>

      <div className="cron-help">
        <h3>Cron Schedule Examples:</h3>
        <ul>
          <li><code>0 0 * * *</code> - Daily at midnight</li>
          <li><code>0 * * * *</code> - Hourly</li>
          <li><code>*/15 * * * *</code> - Every 15 minutes</li>
          <li><code>0 9-17 * * 1-5</code> - Weekdays 9AM-5PM</li>
        </ul>
      </div>
    </div>
  );
};

export default DataSourcesPanel;
