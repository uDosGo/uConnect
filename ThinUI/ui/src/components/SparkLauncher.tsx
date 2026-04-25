import React, { useState } from 'react';
import { sparkLaunch } from '../mcpClient';

const SparkLauncher: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPreviewUrl('');

    try {
      const data = await sparkLaunch(prompt);
      if (data && data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      } else {
        setError('Failed to launch Spark app: invalid response');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="spark-launcher">
      <h2>Launch Spark App</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prompt">Prompt:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the app you want to create..."
            rows={10}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Launching...' : 'Launch Spark App'}
        </button>

        {error && (
          <div className="error">❌ {error}</div>
        )}
      </form>

      {previewUrl && (
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="preview-actions">
            <button onClick={openInNewTab}>Open in New Tab</button>
          </div>
          <iframe
            src={previewUrl}
            title="Spark App Preview"
            width="100%"
            height="600px"
            frameBorder="0"
          />
        </div>
      )}
    </div>
  );
};

export default SparkLauncher;
