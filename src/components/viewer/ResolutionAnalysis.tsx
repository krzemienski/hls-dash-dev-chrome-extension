// src/components/viewer/ResolutionAnalysis.tsx
import type { ParsedManifest } from '../../types/manifest';
import {
  analyzeResolutions,
  getRecommendedResolution,
  analyzeBitrateEfficiency
} from '../../lib/utils/resolution-analyzer';

interface ResolutionAnalysisProps {
  manifest: ParsedManifest;
}

export function ResolutionAnalysis({ manifest }: ResolutionAnalysisProps) {
  const analysis = analyzeResolutions(manifest.variants);
  const efficiency = analyzeBitrateEfficiency(manifest.variants);

  if (!analysis.maxResolution) {
    return null;
  }

  const deviceRecommendations = [
    { type: 'mobile' as const, icon: '📱', label: 'Mobile' },
    { type: 'tablet' as const, icon: '📱', label: 'Tablet' },
    { type: 'desktop' as const, icon: '💻', label: 'Desktop' },
    { type: 'tv' as const, icon: '📺', label: 'TV' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Resolution Analysis
      </h2>

      {/* Resolution Range */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="text-xs text-green-600 font-medium">HIGHEST QUALITY</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {analysis.maxResolution.label}
          </div>
          <div className="text-sm text-green-700 mt-1">
            {analysis.maxResolution.pixels.toLocaleString()} pixels
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">LOWEST QUALITY</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {analysis.minResolution?.label || 'N/A'}
          </div>
          <div className="text-sm text-blue-700 mt-1">
            {analysis.minResolution?.pixels.toLocaleString() || '0'} pixels
          </div>
        </div>
      </div>

      {/* Quality Distribution */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Quality Distribution
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {Object.entries(analysis.qualityDistribution).map(([quality, count]) => (
            count > 0 && (
              <div key={quality} className="bg-gray-50 p-3 rounded text-center border border-gray-200">
                <div className="text-xs text-gray-600">{quality}</div>
                <div className="text-xl font-bold text-gray-900">{count}</div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Aspect Ratio Info */}
      <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-purple-900">
              Aspect Ratio
            </h3>
            <div className="text-2xl font-bold text-purple-900 mt-1">
              {analysis.predominantAspectRatio}
            </div>
          </div>
          {analysis.hasMultipleAspectRatios && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-medium">
              ⚠ Mixed ratios
            </div>
          )}
        </div>
      </div>

      {/* Device Recommendations */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Recommended Quality by Device Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {deviceRecommendations.map(device => {
            const recommended = getRecommendedResolution(manifest.variants, device.type);
            return (
              <div key={device.type} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-2xl mb-1">{device.icon}</div>
                <div className="text-xs text-gray-600">{device.label}</div>
                {recommended?.resolution && (
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    {recommended.resolution.width}x{recommended.resolution.height}
                  </div>
                )}
                {recommended && (
                  <div className="text-xs text-gray-600 mt-1">
                    {formatBitrate(recommended.bitrate)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bitrate Efficiency */}
      {efficiency.variants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Compression Efficiency (Bitrate per Pixel)
          </h3>

          <div className="space-y-2">
            {efficiency.variants
              .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
              .map(({ variant, bitsPerPixel, efficiencyScore }) => (
                <div
                  key={variant.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {variant.resolution!.width}x{variant.resolution!.height}
                    </div>
                    <div className="text-xs text-gray-600">
                      {bitsPerPixel.toFixed(3)} bits/pixel
                    </div>
                  </div>

                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          efficiencyScore >= 70 ? 'bg-green-500' :
                          efficiencyScore >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${efficiencyScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-gray-700 w-12 text-right">
                    {efficiencyScore.toFixed(0)}
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Higher score = more efficient compression. Lower bitrate per pixel is better.
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className={`border rounded-lg p-4 ${
          analysis.recommendations[0].includes('well-structured')
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            analysis.recommendations[0].includes('well-structured')
              ? 'text-green-900'
              : 'text-yellow-900'
          }`}>
            Resolution Recommendations
          </h3>
          <ul className={`text-sm space-y-1 ${
            analysis.recommendations[0].includes('well-structured')
              ? 'text-green-800'
              : 'text-yellow-800'
          }`}>
            {analysis.recommendations.map((rec, index) => (
              <li key={index}>
                {analysis.recommendations[0].includes('well-structured') ? '✓' : '•'} {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatBitrate(bps: number): string {
  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(2)} Mbps`;
  }
  return `${(bps / 1000).toFixed(0)} Kbps`;
}
