// src/components/viewer/TimelineView.tsx
import { useState } from 'react';
import type { ParsedManifest } from '../../types/manifest';
import {
  simulatePlayback,
  generateBandwidthProfile
} from '../../lib/simulation/playback-simulator';

interface TimelineViewProps {
  manifest: ParsedManifest;
}

export function TimelineView({ manifest }: TimelineViewProps) {
  const [profileType, setProfileType] = useState<'stable' | 'varying' | 'degrading' | 'improving'>('varying');
  const [bandwidth, setBandwidth] = useState(2000000); // 2 Mbps default
  const [duration] = useState(60); // 60 seconds

  // Generate bandwidth profile and simulate playback
  const profile = generateBandwidthProfile(profileType, bandwidth, duration);
  const simulation = simulatePlayback(
    manifest.variants,
    profile,
    manifest.metadata.targetDuration || 10
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Playback Simulation
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Bandwidth Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Bandwidth
            </label>
            <select
              value={bandwidth}
              onChange={(e) => setBandwidth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={500000}>500 Kbps (2G)</option>
              <option value={1000000}>1 Mbps (3G)</option>
              <option value={2000000}>2 Mbps (4G)</option>
              <option value={5000000}>5 Mbps (4G+)</option>
              <option value={10000000}>10 Mbps (Wifi)</option>
              <option value={25000000}>25 Mbps (Fast Wifi)</option>
            </select>
          </div>

          {/* Profile Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network Profile
            </label>
            <select
              value={profileType}
              onChange={(e) => setProfileType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="stable">Stable</option>
              <option value="varying">Varying</option>
              <option value="degrading">Degrading</option>
              <option value="improving">Improving</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 font-medium">QUALITY SWITCHES</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {simulation.totalSwitches}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 font-medium">REBUFFERING</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {simulation.rebufferingTime.toFixed(1)}s
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 font-medium">AVG QUALITY</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {formatBitrate(simulation.averageQuality)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 font-medium">SEGMENTS</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {simulation.segments.length}
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Playback Timeline
        </h3>

        <div className="space-y-2">
          {simulation.segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-4">
              {/* Time marker */}
              <div className="w-16 text-xs text-gray-600 font-mono">
                {segment.time}s
              </div>

              {/* Quality bar */}
              <div className="flex-1 relative">
                <div
                  className="h-8 rounded flex items-center px-3 text-white text-xs"
                  style={{
                    width: '100%',
                    background: getQualityColor(segment.variant.bitrate, manifest.variants)
                  }}
                >
                  {formatBitrate(segment.variant.bitrate)}
                  {segment.variant.resolution &&
                    ` - ${segment.variant.resolution.width}x${segment.variant.resolution.height}`
                  }
                </div>

                {/* Buffer health indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center">
                  <div className="text-xs font-medium text-white">
                    {segment.bufferHealth.toFixed(0)}s
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Switches */}
      {simulation.switches.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Quality Switches ({simulation.switches.length})
          </h3>

          <div className="space-y-2">
            {simulation.switches.map((sw, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  sw.reason === 'startup' ? 'bg-blue-50 border-blue-200' :
                  sw.reason === 'upgrade' ? 'bg-green-50 border-green-200' :
                  'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-600">
                      {sw.time}s
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sw.reason === 'startup' ? 'bg-blue-100 text-blue-700' :
                      sw.reason === 'upgrade' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {sw.reason}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700">
                    {sw.fromVariant && (
                      <span>{formatBitrate(sw.fromVariant.bitrate)} →</span>
                    )}
                    <span className="font-semibold ml-2">
                      {formatBitrate(sw.toVariant.bitrate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

function getQualityColor(bitrate: number, allVariants: any[]): string {
  const videoVariants = allVariants.filter(v => v.type === 'video').sort((a, b) => a.bitrate - b.bitrate);
  if (videoVariants.length === 0) return '#3b82f6';

  const index = videoVariants.findIndex(v => v.bitrate === bitrate);
  if (index === -1) return '#3b82f6';

  // Color gradient from red (low) to green (high)
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#10b981'  // emerald
  ];

  const colorIndex = Math.floor((index / (videoVariants.length - 1)) * (colors.length - 1));
  return colors[colorIndex] || '#3b82f6';
}
