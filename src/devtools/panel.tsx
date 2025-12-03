import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import type { DetectedManifest } from '../types/manifest';

function DevToolsPanel() {
  const [manifests, setManifests] = useState<DetectedManifest[]>([]);
  const [tabId] = useState(chrome.devtools.inspectedWindow.tabId);

  useEffect(() => {
    // Listen for manifest detection updates
    const interval = setInterval(async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'get-detected',
          tabId
        });

        if (response.success && response.data) {
          setManifests(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch detected manifests:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [tabId]);

  const handleOpenManifest = (url: string) => {
    const viewerUrl = chrome.runtime.getURL('src/viewer/viewer.html') + '#' + encodeURIComponent(url);
    chrome.tabs.create({ url: viewerUrl });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-900">
              HLS + DASH Manifest Detector
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Detected manifests on this page
            </p>
          </div>

          <div className="p-4">
            {manifests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">🔍</div>
                <p>No manifests detected yet</p>
                <p className="text-xs mt-2">
                  Navigate to a page with HLS (.m3u8) or DASH (.mpd) streams
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {manifests.map((manifest, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            manifest.format === 'hls'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {manifest.format.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {manifest.source}
                          </span>
                        </div>

                        <div className="text-sm text-gray-900 font-mono break-all">
                          {manifest.url}
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                          Page: {manifest.pageUrl}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleCopyUrl(manifest.url)}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleOpenManifest(manifest.url)}
                          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          Analyze
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DevToolsPanel />
  </React.StrictMode>
);
