// src/components/viewer/RawView.tsx
import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import type { ParsedManifest } from '../../types/manifest';

interface RawViewProps {
  manifest: ParsedManifest;
}

export function RawView({ manifest }: RawViewProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [manifest.raw]);

  const language = manifest.format === 'dash' ? 'markup' : 'clike';

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Raw Manifest</h2>
        <button
          onClick={() => {
            navigator.clipboard.writeText(manifest.raw);
          }}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
        >
          Copy
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-auto max-h-[600px]">
        <pre className="p-4 text-sm">
          <code ref={codeRef} className={`language-${language}`}>
            {manifest.raw}
          </code>
        </pre>
      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="text-gray-600">Lines</div>
          <div className="text-lg font-semibold text-gray-900">
            {manifest.raw.split('\n').length}
          </div>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="text-gray-600">Characters</div>
          <div className="text-lg font-semibold text-gray-900">
            {manifest.raw.length.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="text-gray-600">Format</div>
          <div className="text-lg font-semibold text-gray-900">
            {manifest.format.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
