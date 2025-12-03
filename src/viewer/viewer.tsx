import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import { useManifestStore } from '../store/manifest-store';
import { ViewerHeader } from '../components/viewer/ViewerHeader';
import { RawView } from '../components/viewer/RawView';
import { StructuredView } from '../components/viewer/StructuredView';
import { TimelineView } from '../components/viewer/TimelineView';
import { UrlInput } from '../components/viewer/UrlInput';
import { QuickActions } from '../components/viewer/QuickActions';
import { SpecValidatorView } from '../components/viewer/SpecValidatorView';
import { parseManifest } from '../lib/parsers';
import { addToHistory } from '../lib/utils/storage';
import type { ManifestHistoryItem } from '../types/manifest';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ToastContainer } from '../components/common/Toast';

function Viewer() {
  const manifest = useManifestStore((state) => state.manifest);
  const loading = useManifestStore((state) => state.loading);
  const error = useManifestStore((state) => state.error);
  const selectedView = useManifestStore((state) => state.selectedView);
  const viewMode = useManifestStore((state) => state.viewMode);
  const setManifest = useManifestStore((state) => state.setManifest);
  const setLoading = useManifestStore((state) => state.setLoading);
  const setError = useManifestStore((state) => state.setError);
  const setEntryPoint = useManifestStore((state) => state.setEntryPoint);
  const setViewMode = useManifestStore((state) => state.setViewMode);

  // Auto-load manifest from URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const url = decodeURIComponent(hash);

      // NEW v1.1.0: Detect entry point
      const referrer = document.referrer;
      const isFromExtension = referrer.includes('popup.html') ||
                              referrer.includes('panel.html') ||
                              referrer.includes('devtools.html');
      const entryPoint = isFromExtension ? 'manual' : 'interception';

      setEntryPoint(entryPoint);

      // Set default mode based on entry point
      const defaultMode = entryPoint === 'interception' ? 'spec' : 'analysis';
      setViewMode(defaultMode);

      console.log(`[v1.1.0] Entry point: ${entryPoint}, Default mode: ${defaultMode}`);

      loadManifest(url);
    }
  }, []);

  const loadManifest = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      let manifestContent: string;

      // Check if running in extension context
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        // Use service worker
        const response = await chrome.runtime.sendMessage({
          action: 'fetch-manifest',
          url
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch manifest');
        }

        manifestContent = response.data;
      } else {
        // Fallback: Direct fetch (for testing/standalone)
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        manifestContent = await response.text();
      }

      const parsed = parseManifest(manifestContent, url);
      setManifest(parsed);

      // Add to history
      const historyItem: ManifestHistoryItem = {
        url,
        format: parsed.format,
        timestamp: Date.now(),
        variantCount: parsed.variants.length,
        duration: parsed.metadata.duration
      };
      await addToHistory(historyItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load manifest');
    } finally {
      setLoading(false);
    }
  };

  // NEW v1.1.0: Conditional rendering based on viewMode
  if (viewMode === 'spec') {
    return (
      <div className="h-screen flex flex-col">
        {manifest && <ViewerHeader />}
        <div className="flex-1 overflow-hidden">
          <SpecValidatorView />
        </div>
        <ToastContainer />
      </div>
    );
  }

  // Analysis mode (existing v1.0.0 layout)
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

      {/* Quick Actions FAB */}
      {manifest && <QuickActions manifest={manifest} />}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Viewer />
    </ErrorBoundary>
  </React.StrictMode>
);
