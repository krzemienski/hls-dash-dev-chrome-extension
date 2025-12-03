import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import type { DetectedManifest } from '../types/manifest';
import { HistoryTab } from '../components/popup/HistoryTab';
import { SettingsTab } from '../components/popup/SettingsTab';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

function Popup() {
  const [detectedManifests, setDetectedManifests] = useState<DetectedManifest[]>([]);
  const [activeTab, setActiveTab] = useState<'detected' | 'history' | 'settings'>('detected');

  const handleManifestClick = (url: string) => {
    // Open viewer in new tab and pass manifest URL via URL hash
    const viewerUrl = chrome.runtime.getURL('src/viewer/viewer.html') + '#' + encodeURIComponent(url);
    chrome.tabs.create({ url: viewerUrl });
  };

  useEffect(() => {
    // Get current tab ID and fetch detected manifests
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.runtime.sendMessage(
          { action: 'get-detected', tabId: tabs[0].id },
          (response) => {
            if (response.success && response.data) {
              setDetectedManifests(response.data);
            }
          }
        );
      }
    });
  }, []);

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <h1 className="text-lg font-bold">HLS + DASH Viewer</h1>
        <p className="text-xs text-blue-100 mt-1">
          Manifest Analysis Tool
        </p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('detected')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'detected'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Detected ({detectedManifests.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'settings'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'detected' && (
          <div className="p-4">
            {detectedManifests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No manifests detected on this page</p>
                <p className="text-xs mt-2">
                  Browse to a page with HLS or DASH streams
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {detectedManifests.map((manifest, index) => (
                  <div
                    key={index}
                    onClick={() => handleManifestClick(manifest.url)}
                    className="p-3 border border-gray-200 rounded hover:border-blue-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        manifest.format === 'hls'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {manifest.format.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {manifest.source}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 truncate">
                      {manifest.url}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryTab onManifestClick={handleManifestClick} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 p-3 bg-gray-50">
        <button
          onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('src/viewer/viewer.html') })}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Open Full Viewer
        </button>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Popup />
    </ErrorBoundary>
  </React.StrictMode>
);
