// src/components/viewer/UrlInfoPanel.tsx
import type { ParsedManifest } from '../../types/manifest';
import { analyzeManifestUrl } from '../../lib/utils/url-analyzer';

interface UrlInfoPanelProps {
  manifest: ParsedManifest;
}

export function UrlInfoPanel({ manifest }: UrlInfoPanelProps) {
  const analysis = analyzeManifestUrl(manifest.url);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        URL Analysis
      </h2>

      <div className="space-y-4">
        {/* CDN Detection */}
        {analysis.cdn && (
          <div className="bg-purple-50 border border-purple-200 rounded p-3">
            <div className="flex items-center gap-2">
              <span className="text-purple-700 font-semibold">🌐 CDN:</span>
              <span className="text-purple-900 font-bold">{analysis.cdn}</span>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-gray-600 font-medium">Protocol</dt>
            <dd className="text-sm text-gray-900 mt-1 font-mono">{analysis.protocol}</dd>
          </div>

          <div>
            <dt className="text-xs text-gray-600 font-medium">Domain</dt>
            <dd className="text-sm text-gray-900 mt-1 font-mono">{analysis.domain}</dd>
          </div>

          <div className="col-span-2">
            <dt className="text-xs text-gray-600 font-medium">Path</dt>
            <dd className="text-sm text-gray-900 mt-1 font-mono break-all">
              {analysis.path}
            </dd>
          </div>
        </dl>

        {/* Query Parameters */}
        {analysis.queryParams.size > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Query Parameters ({analysis.queryParams.size})
            </h3>
            <div className="space-y-2">
              {Array.from(analysis.queryParams.entries()).map(([key, value]) => {
                const isAuth = analysis.authParams.includes(key);

                return (
                  <div
                    key={key}
                    className={`p-2 rounded ${
                      isAuth ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {key}
                        {isAuth && (
                          <span className="ml-2 text-xs text-yellow-700 font-semibold">
                            🔑 Auth
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(value)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 font-mono break-all">
                      {value.length > 50 ? value.substring(0, 50) + '...' : value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warnings */}
        {analysis.hasAuth && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <h4 className="text-sm font-semibold text-yellow-900">
                  Authentication Detected
                </h4>
                <p className="text-xs text-yellow-800 mt-1">
                  This URL contains authentication parameters. These tokens may expire,
                  making the manifest inaccessible after some time.
                </p>
              </div>
            </div>
          </div>
        )}

        {analysis.hasTimestamp && !analysis.hasAuth && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">ℹ️</span>
              <div>
                <h4 className="text-sm font-semibold text-blue-900">
                  Timestamp Parameter
                </h4>
                <p className="text-xs text-blue-800 mt-1">
                  URL includes timestamp. This may be used for cache busting or time-limited access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
