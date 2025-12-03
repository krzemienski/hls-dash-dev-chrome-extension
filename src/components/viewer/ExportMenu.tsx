// src/components/viewer/ExportMenu.tsx
import { useState } from 'react';
import type { ParsedManifest } from '../../types/manifest';
import { exportToJSON, exportToCSV, exportToText } from '../../lib/export/exporters';

interface ExportMenuProps {
  manifest: ParsedManifest;
}

export function ExportMenu({ manifest }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'json' | 'csv' | 'text') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = exportToJSON(manifest);
        filename = `manifest-${Date.now()}.json`;
        mimeType = 'application/json';
        break;

      case 'csv':
        content = exportToCSV(manifest);
        filename = `manifest-variants-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;

      case 'text':
        content = exportToText(manifest);
        filename = `manifest-report-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
    }

    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
      >
        Export ▼
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('text')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as Text Report
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
