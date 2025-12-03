// Raw Manifest Panel - Left side of Spec Validator Mode
// Shows manifest text with line numbers and error/warning highlighting

import { useMemo } from 'react';
import type { ParsedManifest } from '../../types/manifest';

interface Props {
  manifest: ParsedManifest;
}

export function RawManifestPanel({ manifest }: Props) {
  const validation = manifest.validation;

  // Get error and warning line numbers for highlighting
  const errorLines = useMemo(() => {
    if (!validation) return new Set<number>();
    return new Set(validation.errors.map(e => e.line).filter((l): l is number => l !== undefined));
  }, [validation]);

  const warningLines = useMemo(() => {
    if (!validation) return new Set<number>();
    return new Set(validation.warnings.map(w => w.line).filter((l): l is number => l !== undefined));
  }, [validation]);

  const lines = manifest.raw.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(manifest.raw);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Raw Manifest</h2>
          <p className="text-xs text-gray-500">{manifest.format.toUpperCase()} Format</p>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Copy
        </button>
      </div>

      {/* Line-numbered code display */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const hasError = errorLines.has(lineNumber);
            const hasWarning = warningLines.has(lineNumber);

            return (
              <div
                key={index}
                className={`flex hover:bg-gray-100 ${
                  hasError ? 'bg-red-50 border-l-4 border-red-500' :
                  hasWarning ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                  ''
                }`}
              >
                {/* Line number */}
                <div className="w-16 flex-shrink-0 text-right px-3 py-1 text-xs text-gray-400 select-none bg-gray-100 border-r border-gray-200">
                  {lineNumber}
                </div>

                {/* Line content */}
                <div className="flex-1 px-4 py-1">
                  <code className="text-sm font-mono text-gray-800">{line || ' '}</code>
                </div>

                {/* Error/warning indicator */}
                {hasError && (
                  <div className="w-10 flex-shrink-0 flex items-center justify-center text-red-600">
                    ❌
                  </div>
                )}
                {hasWarning && !hasError && (
                  <div className="w-10 flex-shrink-0 flex items-center justify-center text-yellow-600">
                    ⚠️
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-white border-t border-gray-200 text-xs text-gray-600">
        {lines.length} lines | {manifest.raw.length.toLocaleString()} characters
      </div>
    </div>
  );
}
