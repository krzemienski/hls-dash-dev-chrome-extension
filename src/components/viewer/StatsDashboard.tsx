// src/components/viewer/StatsDashboard.tsx
import type { ParsedManifest } from '../../types/manifest';

interface StatsDashboardProps {
  manifest: ParsedManifest;
}

export function StatsDashboard({ manifest }: StatsDashboardProps) {
  // Calculate various statistics
  const videoVariants = manifest.variants.filter(v => v.type === 'video');
  const audioVariants = manifest.variants.filter(v => v.type === 'audio');
  const subtitleVariants = manifest.variants.filter(v => v.type === 'subtitle');

  // Bitrate statistics
  const bitrates = videoVariants.map(v => v.bitrate);
  const avgBitrate = bitrates.length > 0
    ? bitrates.reduce((sum, b) => sum + b, 0) / bitrates.length
    : 0;
  const minBitrate = bitrates.length > 0 ? Math.min(...bitrates) : 0;
  const maxBitrate = bitrates.length > 0 ? Math.max(...bitrates) : 0;

  // Resolution statistics
  const resolutions = videoVariants
    .filter(v => v.resolution)
    .map(v => v.resolution!.width * v.resolution!.height);
  const maxResolution = resolutions.length > 0 ? Math.max(...resolutions) : 0;
  const maxResVariant = videoVariants.find(
    v => v.resolution && (v.resolution.width * v.resolution.height === maxResolution)
  );

  // Frame rate statistics
  const frameRates = videoVariants
    .filter(v => v.frameRate)
    .map(v => v.frameRate!);
  const maxFrameRate = frameRates.length > 0 ? Math.max(...frameRates) : 0;

  // Codec statistics
  const allCodecs = new Set<string>();
  manifest.variants.forEach(v => v.codecs.forEach(c => allCodecs.add(c)));

  // Data usage estimates (for full content playback)
  const duration = manifest.metadata.duration || 0;
  const lowQualityData = minBitrate > 0 && duration > 0
    ? (minBitrate / 8) * duration
    : 0;
  const highQualityData = maxBitrate > 0 && duration > 0
    ? (maxBitrate / 8) * duration
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Statistics Overview
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Variants */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-xs text-blue-600 font-medium">TOTAL VARIANTS</div>
          <div className="text-3xl font-bold text-blue-900 mt-1">
            {manifest.variants.length}
          </div>
          <div className="text-xs text-blue-700 mt-2">
            {videoVariants.length}V • {audioVariants.length}A • {subtitleVariants.length}S
          </div>
        </div>

        {/* Bitrate Range */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-xs text-purple-600 font-medium">BITRATE RANGE</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {formatBitrate(maxBitrate)}
          </div>
          <div className="text-xs text-purple-700 mt-2">
            {formatBitrate(minBitrate)} → {formatBitrate(maxBitrate)}
          </div>
        </div>

        {/* Average Bitrate */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-xs text-green-600 font-medium">AVERAGE BITRATE</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {formatBitrate(avgBitrate)}
          </div>
          <div className="text-xs text-green-700 mt-2">
            Across {videoVariants.length} variants
          </div>
        </div>

        {/* Max Resolution */}
        {maxResVariant?.resolution && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="text-xs text-orange-600 font-medium">MAX RESOLUTION</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">
              {maxResVariant.resolution.width}x{maxResVariant.resolution.height}
            </div>
            <div className="text-xs text-orange-700 mt-2">
              {getResolutionLabel(maxResVariant.resolution.width, maxResVariant.resolution.height)}
            </div>
          </div>
        )}

        {/* Frame Rate */}
        {maxFrameRate > 0 && (
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg">
            <div className="text-xs text-pink-600 font-medium">MAX FRAME RATE</div>
            <div className="text-2xl font-bold text-pink-900 mt-1">
              {maxFrameRate}
            </div>
            <div className="text-xs text-pink-700 mt-2">
              fps
            </div>
          </div>
        )}

        {/* Codecs */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
          <div className="text-xs text-indigo-600 font-medium">CODECS</div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">
            {allCodecs.size}
          </div>
          <div className="text-xs text-indigo-700 mt-2">
            Unique codecs
          </div>
        </div>

        {/* Duration */}
        {duration > 0 && (
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg col-span-2 md:col-span-3">
            <div className="text-xs text-cyan-600 font-medium">DURATION</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-cyan-900 mt-1">
                {formatDuration(duration)}
              </div>
              <div className="text-sm text-cyan-700">
                {duration.toFixed(2)} seconds
              </div>
            </div>
          </div>
        )}

        {/* Data Usage Estimates */}
        {duration > 0 && maxBitrate > 0 && (
          <>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
              <div className="text-xs text-red-600 font-medium">LOW QUALITY DATA</div>
              <div className="text-2xl font-bold text-red-900 mt-1">
                {formatBytes(lowQualityData)}
              </div>
              <div className="text-xs text-red-700 mt-2">
                @ {formatBitrate(minBitrate)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg col-span-2">
              <div className="text-xs text-amber-600 font-medium">HIGH QUALITY DATA</div>
              <div className="text-2xl font-bold text-amber-900 mt-1">
                {formatBytes(highQualityData)}
              </div>
              <div className="text-xs text-amber-700 mt-2">
                @ {formatBitrate(maxBitrate)} • {(highQualityData / lowQualityData).toFixed(1)}x more data
              </div>
            </div>
          </>
        )}

        {/* Segments */}
        {manifest.segments && manifest.segments.length > 0 && (
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg col-span-2 md:col-span-3">
            <div className="text-xs text-teal-600 font-medium">SEGMENTS</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-teal-900 mt-1">
                {manifest.segments.length}
              </div>
              <div className="text-sm text-teal-700">
                Avg: {(manifest.segments.reduce((sum, s) => sum + s.duration, 0) / manifest.segments.length).toFixed(2)}s per segment
              </div>
            </div>
          </div>
        )}
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

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function getResolutionLabel(width: number, height: number): string {
  if (width >= 3840) return '4K UHD';
  if (width >= 2560) return '2K QHD';
  if (width >= 1920) return '1080p Full HD';
  if (width >= 1280) return '720p HD';
  if (width >= 854) return '480p SD';
  if (width >= 640) return '360p';
  return `${width}x${height}`;
}
