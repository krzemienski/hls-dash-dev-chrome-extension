// src/components/viewer/DRMInfoPanel.tsx
import type { ParsedManifest } from '../../types/manifest';
import { detectDRM, analyzeDRMSystems, analyzePlatformCoverage } from '../../lib/utils/drm-detector';

interface DRMInfoPanelProps {
  manifest: ParsedManifest;
}

export function DRMInfoPanel({ manifest }: DRMInfoPanelProps) {
  const drmResult = detectDRM(manifest.raw, manifest.format);

  if (!drmResult.isEncrypted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔓</span>
          <div>
            <h3 className="font-semibold text-green-900">No Encryption Detected</h3>
            <p className="text-sm text-green-700 mt-1">
              This manifest does not use DRM. Content is accessible without decryption keys.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const systemsInfo = analyzeDRMSystems(drmResult.systems);
  const coverage = analyzePlatformCoverage(drmResult.systems);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        DRM & Content Protection
      </h2>

      {/* Encryption Status */}
      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔒</span>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Content is Encrypted</h3>
            <p className="text-sm text-red-700 mt-1">
              This manifest uses DRM protection. Playback requires valid license keys.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Coverage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Platform Coverage
          </h3>
          <div className={`px-3 py-1 rounded text-sm font-bold ${
            coverage.coverage >= 90 ? 'bg-green-100 text-green-700' :
            coverage.coverage >= 60 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {coverage.coverage}%
          </div>
        </div>

        {/* Coverage Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
          <div
            className={`h-4 rounded-full transition-all ${
              coverage.coverage >= 90 ? 'bg-green-500' :
              coverage.coverage >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${coverage.coverage}%` }}
          />
        </div>

        {coverage.missingPlatforms.length > 0 && (
          <div className="text-xs text-gray-600">
            Missing coverage: {coverage.missingPlatforms.join(', ')}
          </div>
        )}
      </div>

      {/* DRM Systems */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          DRM Systems ({systemsInfo.length})
        </h3>

        <div className="space-y-3">
          {systemsInfo.map((system) => (
            <div
              key={system.name}
              className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{system.name}</h4>
                  <div className="text-xs text-gray-600 mt-1">
                    by {system.vendor}
                    {system.level && ` • ${system.level}`}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  system.name === 'Widevine' ? 'bg-green-100 text-green-700' :
                  system.name === 'FairPlay' ? 'bg-blue-100 text-blue-700' :
                  system.name === 'PlayReady' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {system.vendor}
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3">
                {system.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {system.platforms.map((platform, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {platform}
                  </span>
                ))}
              </div>

              {system.uuid && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600">System UUID</div>
                  <div className="text-xs text-gray-900 font-mono mt-1">
                    {system.uuid}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Formats */}
      {drmResult.keyFormats.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Encryption Methods
          </h3>
          <div className="flex flex-wrap gap-2">
            {drmResult.keyFormats.map((format, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded font-mono text-xs"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Multi-DRM Badge */}
      {drmResult.hasMultipleSystems && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <h3 className="text-sm font-semibold text-purple-900">
                Multi-DRM Configuration
              </h3>
              <p className="text-xs text-purple-700 mt-1">
                This manifest uses multiple DRM systems for maximum platform compatibility
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {coverage.recommendations.length > 0 && (
        <div className={`mt-6 border rounded-lg p-4 ${
          coverage.coverage >= 90
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            coverage.coverage >= 90
              ? 'text-green-900'
              : 'text-yellow-900'
          }`}>
            DRM Recommendations
          </h3>
          <ul className={`text-sm space-y-1 ${
            coverage.coverage >= 90
              ? 'text-green-800'
              : 'text-yellow-800'
          }`}>
            {coverage.recommendations.map((rec, index) => (
              <li key={index}>
                {coverage.coverage >= 90 ? '✓' : '•'} {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
