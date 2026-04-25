import React, { useState } from 'react';
import { mcpClient } from '../mcpClient';

const RepoMindPanel: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [indexPath, setIndexPath] = useState('~/Code/Vault/indexes');
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [loadingDiscover, setLoadingDiscover] = useState(false);
  const [indexResult, setIndexResult] = useState<{ success: boolean; message?: string; indexPath?: string; error?: string } | null>(null);
  const [discoverResult, setDiscoverResult] = useState<{ success: boolean; logs?: string; error?: string } | null>(null);

  const handleIndexRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingIndex(true);
    setIndexResult(null);

    try {
      const response = await mcpClient.createCopernicusIndex(repoUrl, indexPath);
      setIndexResult({
        success: response.success,
        message: response.success ? 'Index created successfully!' : response.error,
        indexPath: response.data?.indexPath,
        error: response.success ? undefined : response.error,
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
      const response = await mcpClient.discoverRepo(repoUrl);
      setDiscoverResult({
        success: response.success,
        logs: response.data?.logs,
        error: response.success ? undefined : response.error,
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

      <div className="form-group">
        <label htmlFor="indexPath">Index Path:</label>
        <input
          type="text"
          id="indexPath"
          value={indexPath}
          onChange={(e) => setIndexPath(e.target.value)}
          placeholder="~/Code/Vault/indexes"
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
