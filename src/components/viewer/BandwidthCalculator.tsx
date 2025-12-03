// src/components/viewer/BandwidthCalculator.tsx
import { useState } from 'react';
import type { ParsedManifest } from '../../types/manifest';
import { getRecommendedVariant } from '../../lib/utils/abr-analysis';

interface BandwidthCalculatorProps {
  manifest: ParsedManifest;
}

export function BandwidthCalculator({ manifest }: BandwidthCalculatorProps) {
  const [bandwidth, setBandwidth] = useState(5000000); // 5 Mbps default

  const videoVariants = manifest.variants.filter(v => v.type === 'video');

  if (videoVariants.length === 0) {
    return null;
  }

  const recommended = getRecommendedVariant(manifest.variants, bandwidth);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Bandwidth Calculator
      </h2>

      <div className="space-y-4">
        {/* Bandwidth Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Bandwidth: {formatBitrate(bandwidth)}
          </label>
          <input
            type="range"
            min="100000"
            max="50000000"
            step="100000"
            value={bandwidth}
            onChange={(e) => setBandwidth(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>100 Kbps</span>
            <span>50 Mbps</span>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: '2G', value: 500000 },
            { label: '3G', value: 1500000 },
            { label: '4G', value: 5000000 },
            { label: 'WiFi', value: 10000000 },
            { label: 'Fast', value: 25000000 }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => setBandwidth(preset.value)}
              className={`px-3 py-1 text-xs rounded ${
                Math.abs(bandwidth - preset.value) < 100000
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Recommended Variant */}
        {recommended && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Recommended Quality
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Bitrate:</span>
                <span className="font-bold text-blue-900">
                  {formatBitrate(recommended.bitrate)}
                </span>
              </div>
              {recommended.resolution && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Resolution:</span>
                  <span className="font-bold text-blue-900">
                    {recommended.resolution.width}x{recommended.resolution.height}
                  </span>
                </div>
              )}
              {recommended.frameRate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Frame Rate:</span>
                  <span className="font-bold text-blue-900">
                    {recommended.frameRate} fps
                  </span>
                </div>
              )}
            </div>

            {/* Safety Margin Explanation */}
            <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-700">
              Using 85% of available bandwidth ({formatBitrate(bandwidth * 0.85)}) for stability
            </div>
          </div>
        )}

        {/* All Variants Compatibility */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Quality Levels for This Bandwidth
          </h3>
          {videoVariants.map((variant) => {
            const canPlay = variant.bitrate <= bandwidth * 0.85;
            const isRecommended = recommended?.id === variant.id;

            return (
              <div
                key={variant.id}
                className={`flex items-center justify-between p-2 rounded ${
                  isRecommended ? 'bg-green-50 border border-green-200' :
                  canPlay ? 'bg-gray-50' :
                  'bg-red-50 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${canPlay ? 'text-gray-900' : 'text-gray-400'}`}>
                    {formatBitrate(variant.bitrate)}
                  </span>
                  {variant.resolution && (
                    <span className={`text-xs ${canPlay ? 'text-gray-600' : 'text-gray-400'}`}>
                      {variant.resolution.width}x{variant.resolution.height}
                    </span>
                  )}
                </div>
                <div>
                  {isRecommended && (
                    <span className="text-xs text-green-700 font-medium">
                      ✓ Recommended
                    </span>
                  )}
                  {!canPlay && (
                    <span className="text-xs text-red-600">
                      ✗ Too high
                    </span>
                  )}
                  {canPlay && !isRecommended && (
                    <span className="text-xs text-gray-500">
                      ✓ Playable
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
