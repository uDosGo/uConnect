import React, { useState } from 'react';
import { createAgenticWorkflow } from '../mcpClient';

const WorkflowsPanel: React.FC = () => {
  const [repo, setRepo] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await createAgenticWorkflow(description, repo);
      setResult({
        success: true,
        message: 'Workflow created successfully!',
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
    <div className="workflows-panel">
      <h2>Create Agentic Workflow</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="repo">Repository (owner/repo):</label>
          <input
            type="text"
            id="repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="e.g., uDosGo/test-repo"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this workflow should do..."
            rows={5}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Workflow'}
        </button>

        {result && (
          <div className={result.success ? 'success' : 'error'}>
            {result.success ? '✅' : '❌'} {result.message || result.error}
          </div>
        )}
      </form>
    </div>
  );
};

export default WorkflowsPanel;
