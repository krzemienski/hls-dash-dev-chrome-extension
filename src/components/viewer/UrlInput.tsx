// src/components/viewer/UrlInput.tsx
import { useState } from 'react';
import { useManifestStore } from '../../store/manifest-store';
import { parseManifest } from '../../lib/parsers';

export function UrlInput() {
  const [url, setUrl] = useState('');
  const setManifest = useManifestStore((state) => state.setManifest);
  const setLoading = useManifestStore((state) => state.setLoading);
  const setError = useManifestStore((state) => state.setError);

  const handleLoad = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send message to service worker to fetch manifest
      const response = await chrome.runtime.sendMessage({
        action: 'fetch-manifest',
        url: url.trim()
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch manifest');
      }

      // Parse the manifest
      const parsed = parseManifest(response.data, url.trim());
      setManifest(parsed);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load manifest');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoad();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <label htmlFor="manifest-url" className="block text-sm font-medium text-gray-700 mb-2">
        Manifest URL
      </label>
      <div className="flex gap-2">
        <input
          id="manifest-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="https://example.com/manifest.m3u8 or .mpd"
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLoad}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Load
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Supports HLS (.m3u8) and DASH (.mpd) manifests
      </p>
    </div>
  );
}
