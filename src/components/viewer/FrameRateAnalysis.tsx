// src/components/viewer/FrameRateAnalysis.tsx
import type { ParsedManifest } from '../../types/manifest';
import {
  analyzeFrameRates,
  categorizeFrameRate,
  calculateBitsPerFrame
} from '../../lib/utils/framerate-analyzer';

interface FrameRateAnalysisProps {
  manifest: ParsedManifest;
}

export function FrameRateAnalysis({ manifest }: FrameRateAnalysisProps) {
  const analysis = analyzeFrameRates(manifest.variants);
  const videoVariants = manifest.variants.filter(v => v.type === 'video' && v.frameRate);

  if (videoVariants.length === 0 || analysis.maxFrameRate === null) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Frame Rate Analysis
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-xs text-orange-600 font-medium">MINIMUM</div>
          <div className="text-3xl font-bold text-orange-900 mt-1">
            {analysis.minFrameRate}
          </div>
          <div className="text-xs text-orange-700 mt-1">fps</div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">AVERAGE</div>
          <div className="text-3xl font-bold text-blue-900 mt-1">
            {analysis.avgFrameRate?.toFixed(1)}
          </div>
          <div className="text-xs text-blue-700 mt-1">fps</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-xs text-green-600 font-medium">MAXIMUM</div>
          <div className="text-3xl font-bold text-green-900 mt-1">
            {analysis.maxFrameRate}
          </div>
          <div className="text-xs text-green-700 mt-1">fps</div>
        </div>
      </div>

      {/* HFR Badge */}
      {analysis.hasHighFrameRate && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <div>
              <h3 className="text-sm font-semibold text-purple-900">
                High Frame Rate (HFR) Supported
              </h3>
              <p className="text-xs text-purple-700 mt-1">
                This manifest includes 60fps+ variants for smooth sports and action content
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Frame Rate Details */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Frame Rate Distribution
        </h3>
        <div className="space-y-3">
          {Array.from(analysis.frameRateDistribution.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([fps, count]) => {
              const category = categorizeFrameRate(fps);

              return (
                <div key={fps} className="flex items-center gap-4">
                  <div className="w-20 text-right">
                    <div className="text-lg font-bold text-gray-900">{fps}</div>
                    <div className="text-xs text-gray-600">fps</div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="text-sm font-medium text-gray-900">
                        {category.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {count} variant{count > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Smoothness bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          category.smoothnessScore >= 90 ? 'bg-green-500' :
                          category.smoothnessScore >= 75 ? 'bg-blue-500' :
                          category.smoothnessScore >= 60 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${category.smoothnessScore}%` }}
                      />
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {category.useCase}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Bits per Frame Analysis */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Bits per Frame (Compression Efficiency)
        </h3>
        <div className="space-y-2">
          {videoVariants.map(variant => {
            const bpf = calculateBitsPerFrame(variant);
            if (!bpf) return null;

            return (
              <div key={variant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-900">
                    {variant.frameRate}fps
                  </div>
                  {variant.resolution && (
                    <div className="text-xs text-gray-600">
                      {variant.resolution.width}x{variant.resolution.height}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-700">
                    {formatBitsPerFrame(bpf)}
                  </div>
                  <div className="text-xs text-gray-500">
                    @ {formatBitrate(variant.bitrate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Higher bits per frame allows more detail in each frame
        </div>
      </div>

      {/* Consistency Status */}
      {!analysis.hasConsistentFrameRates && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">
            ⚠ Inconsistent Frame Rates
          </h3>
          <p className="text-xs text-yellow-800">
            Variants have different frame rates ({analysis.minFrameRate}fps - {analysis.maxFrameRate}fps).
            This may cause visual discontinuity during quality switching.
          </p>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className={`mt-6 border rounded-lg p-4 ${
          analysis.recommendations[0].includes('good')
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            analysis.recommendations[0].includes('good')
              ? 'text-green-900'
              : 'text-yellow-900'
          }`}>
            Frame Rate Recommendations
          </h3>
          <ul className={`text-sm space-y-1 ${
            analysis.recommendations[0].includes('good')
              ? 'text-green-800'
              : 'text-yellow-800'
          }`}>
            {analysis.recommendations.map((rec, index) => (
              <li key={index}>
                {analysis.recommendations[0].includes('good') ? '✓' : '•'} {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatBitsPerFrame(bpf: number): string {
  if (bpf >= 1000000) {
    return `${(bpf / 1000000).toFixed(2)} Mb/frame`;
  }
  if (bpf >= 1000) {
    return `${(bpf / 1000).toFixed(1)} Kb/frame`;
  }
  return `${bpf.toFixed(0)} b/frame`;
}

function formatBitrate(bps: number): string {
  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(2)} Mbps`;
  }
  return `${(bps / 1000).toFixed(0)} Kbps`;
}
