// src/components/viewer/QuickActions.tsx
import { useState } from 'react';
import type { ParsedManifest } from '../../types/manifest';
import { exportToJSON } from '../../lib/export/exporters';
import { copyVariantUrls } from '../../lib/utils/clipboard';

interface QuickActionsProps {
  manifest: ParsedManifest;
}

export function QuickActions({ manifest }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Copy Manifest URL',
      icon: '🔗',
      handler: () => {
        navigator.clipboard.writeText(manifest.url);
        setIsOpen(false);
      }
    },
    {
      label: 'Copy All Variant URLs',
      icon: '📋',
      handler: () => {
        copyVariantUrls(manifest.variants);
        setIsOpen(false);
      }
    },
    {
      label: 'Quick Export JSON',
      icon: '💾',
      handler: () => {
        const content = exportToJSON(manifest);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manifest-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
      }
    },
    {
      label: 'Copy Raw Manifest',
      icon: '📄',
      handler: () => {
        navigator.clipboard.writeText(manifest.raw);
        setIsOpen(false);
      }
    },
    {
      label: 'Open in New Tab',
      icon: '🔄',
      handler: () => {
        const viewerUrl = chrome.runtime.getURL('src/viewer/viewer.html') +
          '#' + encodeURIComponent(manifest.url);
        window.open(viewerUrl, '_blank');
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Action Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-20"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Items */}
          <div className="relative mb-4 space-y-2">
            {actions.map((action, index) => (
              <div
                key={index}
                onClick={action.handler}
                className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3 min-w-[200px]"
                style={{
                  animation: `slideUp 0.2s ease-out ${index * 0.05}s both`
                }}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-900">
                  {action.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xl transition-all ${
          isOpen
            ? 'bg-red-600 hover:bg-red-700 rotate-45'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isOpen ? '×' : '⚡'}
      </button>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
