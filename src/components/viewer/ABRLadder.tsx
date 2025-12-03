// src/components/viewer/ABRLadder.tsx
import type { ParsedManifest } from '../../types/manifest';
import { analyzeBitrateLadder } from '../../lib/utils/abr-analysis';

interface ABRLadderProps {
  manifest: ParsedManifest;
}

export function ABRLadder({ manifest }: ABRLadderProps) {
  const videoVariants = manifest.variants
    .filter(v => v.type === 'video')
    .sort((a, b) => a.bitrate - b.bitrate);

  if (videoVariants.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">ABR Ladder Analysis</h2>
        <p className="text-gray-600">No video variants to analyze</p>
      </div>
    );
  }

  const analysis = analyzeBitrateLadder(manifest.variants);
  const maxBitrate = analysis.highestBitrate;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        ABR Ladder Analysis
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-xs text-blue-600 font-medium">LOWEST</div>
          <div className="text-lg font-bold text-blue-900 mt-1">
            {formatBitrate(analysis.lowestBitrate)}
          </div>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-xs text-purple-600 font-medium">AVERAGE GAP</div>
          <div className="text-lg font-bold text-purple-900 mt-1">
            {formatBitrate(analysis.averageGap)}
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-xs text-green-600 font-medium">HIGHEST</div>
          <div className="text-lg font-bold text-green-900 mt-1">
            {formatBitrate(analysis.highestBitrate)}
          </div>
        </div>
      </div>

      {/* Visual Ladder */}
      <div className="space-y-3 mb-6">
        {videoVariants.map((variant, index) => {
          const widthPercent = (variant.bitrate / maxBitrate) * 100;

          return (
            <div key={variant.id}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-24 text-sm font-medium text-gray-700">
                  {formatBitrate(variant.bitrate)}
                </div>
                <div className="flex-1">
                  <div
                    className="h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center px-3 text-white text-xs font-medium"
                    style={{ width: `${widthPercent}%` }}
                  >
                    {variant.resolution &&
                      `${variant.resolution.width}x${variant.resolution.height}`
                    }
                    {variant.frameRate && ` @ ${variant.frameRate}fps`}
                  </div>
                </div>
              </div>

              {/* Show gap if there's a large jump to next variant */}
              {index < videoVariants.length - 1 && (
                (() => {
                  const gap = videoVariants[index + 1].bitrate - variant.bitrate;
                  const isLargeGap = gap > analysis.averageGap * 1.5;

                  if (isLargeGap) {
                    return (
                      <div className="ml-24 text-xs text-orange-600 font-medium">
                        ⚠ Large gap: {formatBitrate(gap)}
                      </div>
                    );
                  }
                  return null;
                })()
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            Recommendations
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
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
