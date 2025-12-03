import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import { useManifestStore } from '../store/manifest-store';
import { ViewerHeader } from '../components/viewer/ViewerHeader';
import { RawView } from '../components/viewer/RawView';
import { StructuredView } from '../components/viewer/StructuredView';
import { TimelineView } from '../components/viewer/TimelineView';
import { UrlInput } from '../components/viewer/UrlInput';
import { parseManifest } from '../lib/parsers';

function Viewer() {
  const manifest = useManifestStore((state) => state.manifest);
  const loading = useManifestStore((state) => state.loading);
  const error = useManifestStore((state) => state.error);
  const selectedView = useManifestStore((state) => state.selectedView);
  const setManifest = useManifestStore((state) => state.setManifest);
  const setLoading = useManifestStore((state) => state.setLoading);
  const setError = useManifestStore((state) => state.setError);

  // Auto-load manifest from URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const url = decodeURIComponent(hash);
      loadManifest(url);
    }
  }, []);

  const loadManifest = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'fetch-manifest',
        url
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch manifest');
      }

      const parsed = parseManifest(response.data, url);
      setManifest(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load manifest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {manifest && <ViewerHeader />}

      <main className="container mx-auto px-6 py-6">
        {/* URL Input */}
        <div className="mb-6">
          <UrlInput />
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading manifest...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!manifest && !loading && !error && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Manifest Loaded
            </h2>
            <p className="text-gray-600">
              Load a manifest from the popup or paste a URL below
            </p>
          </div>
        )}

        {manifest && !loading && (
          <div>
            {selectedView === 'raw' && <RawView manifest={manifest} />}
            {selectedView === 'structured' && <StructuredView manifest={manifest} />}
            {selectedView === 'timeline' && <TimelineView manifest={manifest} />}
          </div>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Viewer />
  </React.StrictMode>
);
