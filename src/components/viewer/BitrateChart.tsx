// src/components/viewer/BitrateChart.tsx
import type { Variant } from '../../types/manifest';

interface BitrateChartProps {
  variants: Variant[];
}

export function BitrateChart({ variants }: BitrateChartProps) {
  const videoVariants = variants
    .filter(v => v.type === 'video')
    .sort((a, b) => a.bitrate - b.bitrate);

  if (videoVariants.length === 0) {
    return null;
  }

  const maxBitrate = videoVariants[videoVariants.length - 1].bitrate;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Bitrate Distribution
      </h2>

      {/* Bar Chart */}
      <div className="space-y-3 mb-6">
        {videoVariants.map((variant, index) => {
          const widthPercent = (variant.bitrate / maxBitrate) * 100;
          const color = getBarColor(index, videoVariants.length);

          return (
            <div key={variant.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-8">#{index + 1}</span>
                {variant.resolution && (
                  <span>{variant.resolution.width}x{variant.resolution.height}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                  <div
                    className="h-full rounded-full flex items-center px-3 text-white text-xs font-medium"
                    style={{
                      width: `${widthPercent}%`,
                      background: color
                    }}
                  >
                    {formatBitrate(variant.bitrate)}
                  </div>
                </div>
                <div className="w-20 text-xs text-gray-500 text-right">
                  {widthPercent.toFixed(0)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div>
          <div className="text-xs text-gray-600">Range</div>
          <div className="text-sm font-semibold text-gray-900 mt-1">
            {formatBitrate(videoVariants[videoVariants.length - 1].bitrate - videoVariants[0].bitrate)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Median</div>
          <div className="text-sm font-semibold text-gray-900 mt-1">
            {formatBitrate(
              videoVariants[Math.floor(videoVariants.length / 2)].bitrate
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Average</div>
          <div className="text-sm font-semibold text-gray-900 mt-1">
            {formatBitrate(
              videoVariants.reduce((sum, v) => sum + v.bitrate, 0) / videoVariants.length
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBitrate(bps: number): string {
  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(2)} Mbps`;
  }
  return `${(bps / 1000).toFixed(0)} Kbps`;
}

function getBarColor(index: number, total: number): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6'  // blue
  ];

  if (total === 1) return colors[4]; // green for single variant

  const colorIndex = Math.floor((index / (total - 1)) * (colors.length - 1));
  return colors[colorIndex];
}
