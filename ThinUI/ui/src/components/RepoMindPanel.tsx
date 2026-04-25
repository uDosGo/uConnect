import React, { useState } from 'react';
import { indexCopernicus, discoverRepo } from '../mcpClient';

const RepoMindPanel: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [loadingDiscover, setLoadingDiscover] = useState(false);
  const [indexResult, setIndexResult] = useState<{ success: boolean; message?: string; indexPath?: string; error?: string } | null>(null);
  const [discoverResult, setDiscoverResult] = useState<{ success: boolean; logs?: string; error?: string } | null>(null);

  const handleIndexRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingIndex(true);
    setIndexResult(null);

    try {
      const data = await indexCopernicus(repoUrl);
      setIndexResult({
        success: true,
        message: 'Index created successfully!',
        indexPath: data.indexPath,
      });
    } catch (error) {
      setIndexResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoadingIndex(false);
    }
  };

  const handleDiscoverRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingDiscover(true);
    setDiscoverResult(null);

    try {
      const data = await discoverRepo(repoUrl);
      setDiscoverResult({
        success: true,
        logs: data.logs,
      });
    } catch (error) {
      setDiscoverResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoadingDiscover(false);
    }
  };

  return (
    <div className="repo-mind-panel">
      <h2>Repository Mind</h2>

      <div className="form-group">
        <label htmlFor="repoUrl">Repository URL:</label>
        <input
          type="text"
          id="repoUrl"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/uDosGo/test-repo.git"
          required
        />
      </div>

      <div className="actions">
        <button onClick={handleIndexRepo} disabled={loadingIndex || !repoUrl}>
          {loadingIndex ? 'Indexing...' : 'Create Copernicus Index'}
        </button>

        <button onClick={handleDiscoverRepo} disabled={loadingDiscover || !repoUrl}>
          {loadingDiscover ? 'Discovering...' : 'Discover Repository'}
        </button>
      </div>

      {indexResult && (
        <div className={indexResult.success ? 'success' : 'error'}>
          <h3>Index Result:</h3>
          {indexResult.success ? '✅' : '❌'} {indexResult.message || indexResult.error}
          {indexResult.indexPath && (
            <div>Index saved to: {indexResult.indexPath}</div>
          )}
        </div>
      )}

      {discoverResult && (
        <div className={discoverResult.success ? 'success' : 'error'}>
          <h3>Discovery Result:</h3>
          {discoverResult.success ? '✅' : '❌'} {discoverResult.success ? 'Repository discovered successfully!' : discoverResult.error}
          {discoverResult.logs && (
            <div className="logs">
              <h4>Logs:</h4>
              <pre>{discoverResult.logs}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepoMindPanel;
