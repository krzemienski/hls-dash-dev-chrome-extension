// src/components/viewer/VariantComparison.tsx
import { useState } from 'react';
import type { Variant } from '../../types/manifest';

interface VariantComparisonProps {
  variants: Variant[];
}

export function VariantComparison({ variants }: VariantComparisonProps) {
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const videoVariants = variants.filter(v => v.type === 'video');

  if (videoVariants.length < 2) {
    return null;
  }

  const toggleVariant = (id: string) => {
    if (selectedVariants.includes(id)) {
      setSelectedVariants(selectedVariants.filter(vid => vid !== id));
    } else {
      if (selectedVariants.length < 4) {
        setSelectedVariants([...selectedVariants, id]);
      }
    }
  };

  const compareVariants = videoVariants.filter(v => selectedVariants.includes(v.id));

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Variant Comparison
      </h2>

      {/* Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">
          Select up to 4 variants to compare (selected: {selectedVariants.length}/4)
        </p>
        <div className="flex flex-wrap gap-2">
          {videoVariants.map((variant, index) => (
            <button
              key={variant.id}
              onClick={() => toggleVariant(variant.id)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedVariants.includes(variant.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={!selectedVariants.includes(variant.id) && selectedVariants.length >= 4}
            >
              #{index + 1} - {formatBitrate(variant.bitrate)}
              {variant.resolution && ` (${variant.resolution.width}x${variant.resolution.height})`}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {compareVariants.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Property</th>
                {compareVariants.map((variant) => (
                  <th key={variant.id} className="text-left py-3 px-4 font-semibold text-gray-900">
                    Variant #{videoVariants.indexOf(variant) + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Bitrate Row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Bitrate</td>
                {compareVariants.map(v => {
                  const isHighest = v.bitrate === Math.max(...compareVariants.map(cv => cv.bitrate));
                  return (
                    <td key={v.id} className={`py-3 px-4 ${isHighest ? 'font-bold text-green-700' : 'text-gray-900'}`}>
                      {formatBitrate(v.bitrate)}
                      {isHighest && ' 👑'}
                    </td>
                  );
                })}
              </tr>

              {/* Resolution Row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Resolution</td>
                {compareVariants.map(v => {
                  const pixels = v.resolution ? v.resolution.width * v.resolution.height : 0;
                  const isHighest = pixels === Math.max(...compareVariants.map(cv =>
                    cv.resolution ? cv.resolution.width * cv.resolution.height : 0
                  ));
                  return (
                    <td key={v.id} className={`py-3 px-4 ${isHighest && pixels > 0 ? 'font-bold text-green-700' : 'text-gray-900'}`}>
                      {v.resolution
                        ? `${v.resolution.width}x${v.resolution.height}`
                        : 'N/A'}
                      {isHighest && pixels > 0 && ' 👑'}
                    </td>
                  );
                })}
              </tr>

              {/* Frame Rate Row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Frame Rate</td>
                {compareVariants.map(v => {
                  const isHighest = v.frameRate === Math.max(...compareVariants.map(cv => cv.frameRate || 0));
                  return (
                    <td key={v.id} className={`py-3 px-4 ${isHighest && v.frameRate ? 'font-bold text-green-700' : 'text-gray-900'}`}>
                      {v.frameRate ? `${v.frameRate} fps` : 'N/A'}
                      {isHighest && v.frameRate && ' 👑'}
                    </td>
                  );
                })}
              </tr>

              {/* Codecs Row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Codecs</td>
                {compareVariants.map(v => (
                  <td key={v.id} className="py-3 px-4 text-gray-900 font-mono text-xs">
                    {v.codecs.length > 0 ? v.codecs.join(', ') : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Data Usage (1 hour) */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Data / hour</td>
                {compareVariants.map(v => {
                  const bytesPerHour = (v.bitrate / 8) * 3600;
                  const isLowest = bytesPerHour === Math.min(...compareVariants.map(cv => (cv.bitrate / 8) * 3600));
                  return (
                    <td key={v.id} className={`py-3 px-4 ${isLowest ? 'font-bold text-blue-700' : 'text-gray-900'}`}>
                      {formatBytes(bytesPerHour)}
                      {isLowest && ' 💰'}
                    </td>
                  );
                })}
              </tr>

              {/* Bitrate Difference from Previous */}
              <tr className="hover:bg-gray-50 bg-blue-50">
                <td className="py-3 px-4 font-medium text-gray-700">vs Previous</td>
                {compareVariants.map((v, index) => {
                  if (index === 0) {
                    return <td key={v.id} className="py-3 px-4 text-gray-500">—</td>;
                  }
                  const diff = v.bitrate - compareVariants[index - 1].bitrate;
                  const percentage = ((diff / compareVariants[index - 1].bitrate) * 100).toFixed(0);
                  return (
                    <td key={v.id} className="py-3 px-4 text-blue-700 font-medium">
                      +{formatBitrate(diff)} (+{percentage}%)
                    </td>
                  );
                })}
              </tr>

              {/* URL Row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Playlist URL</td>
                {compareVariants.map(v => (
                  <td key={v.id} className="py-3 px-4">
                    <div className="text-xs text-gray-600 font-mono break-all mb-1">
                      {v.url.substring(v.url.lastIndexOf('/') + 1)}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(v.url)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Copy full URL
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Comparison Summary */}
      {compareVariants.length >= 2 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Comparison Summary
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div>
              • Bitrate range: {formatBitrate(
                compareVariants[compareVariants.length - 1].bitrate - compareVariants[0].bitrate
              )}
            </div>
            <div>
              • Quality steps: {compareVariants.length - 1}
            </div>
            <div>
              • Data usage difference: {(
                ((compareVariants[compareVariants.length - 1].bitrate / 8) * 3600) /
                ((compareVariants[0].bitrate / 8) * 3600)
              ).toFixed(1)}x more data at highest quality
            </div>
          </div>
        </div>
      )}

      {selectedVariants.length < 2 && (
        <div className="text-center py-8 text-gray-500">
          Select at least 2 variants to compare
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

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}
