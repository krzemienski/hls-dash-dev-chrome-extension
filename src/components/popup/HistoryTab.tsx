// src/components/popup/HistoryTab.tsx
import { useState, useEffect } from 'react';
import type { ManifestHistoryItem } from '../../types/manifest';
import { getHistory, clearHistory } from '../../lib/utils/storage';

interface HistoryTabProps {
  onManifestClick: (url: string) => void;
}

export function HistoryTab({ onManifestClick }: HistoryTabProps) {
  const [history, setHistory] = useState<ManifestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const items = await getHistory();
      setHistory(items);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear all history?')) {
      await clearHistory();
      setHistory([]);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No history yet</p>
        <p className="text-xs mt-2">
          Manifests you view will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">
          Recent Manifests ({history.length})
        </h3>
        <button
          onClick={handleClearHistory}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item, index) => (
          <div
            key={index}
            onClick={() => onManifestClick(item.url)}
            className="p-3 border border-gray-200 rounded hover:border-blue-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                item.format === 'hls'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {item.format.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                {formatTimestamp(item.timestamp)}
              </span>
            </div>

            {item.title && (
              <div className="text-sm font-medium text-gray-900 mb-1">
                {item.title}
              </div>
            )}

            <div className="text-xs text-gray-600 truncate">
              {item.url}
            </div>

            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span>{item.variantCount} variants</span>
              {item.duration && <span>{formatDuration(item.duration)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes === 0 ? 'Just now' : `${minutes}m ago`;
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Fallback to date
  return date.toLocaleDateString();
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
