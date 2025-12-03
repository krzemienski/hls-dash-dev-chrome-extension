// src/components/viewer/VariantSearch.tsx
import { useState, useMemo } from 'react';
import type { Variant } from '../../types/manifest';

interface VariantSearchProps {
  variants: Variant[];
  onFilteredChange: (filtered: Variant[]) => void;
}

export function VariantSearch({ variants, onFilteredChange }: VariantSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'subtitle'>('all');
  const [minBitrate, setMinBitrate] = useState<number>(0);
  const [maxBitrate, setMaxBitrate] = useState<number>(Number.MAX_SAFE_INTEGER);
  const [selectedCodec, setSelectedCodec] = useState<string>('all');
  const [minResolution, setMinResolution] = useState<string>('all');

  // Get all unique codecs
  const allCodecs = useMemo(() => {
    const codecSet = new Set<string>();
    variants.forEach(v => v.codecs.forEach(c => codecSet.add(c)));
    return Array.from(codecSet).sort();
  }, [variants]);

  // Filter variants
  const filteredVariants = useMemo(() => {
    return variants.filter(variant => {
      // Type filter
      if (filterType !== 'all' && variant.type !== filterType) {
        return false;
      }

      // Search term filter (matches URL, ID, or codec)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesUrl = variant.url.toLowerCase().includes(term);
        const matchesId = variant.id.toLowerCase().includes(term);
        const matchesCodec = variant.codecs.some(c => c.toLowerCase().includes(term));

        if (!matchesUrl && !matchesId && !matchesCodec) {
          return false;
        }
      }

      // Bitrate filter
      if (variant.bitrate < minBitrate || variant.bitrate > maxBitrate) {
        return false;
      }

      // Codec filter
      if (selectedCodec !== 'all' && !variant.codecs.includes(selectedCodec)) {
        return false;
      }

      // Resolution filter
      if (minResolution !== 'all' && variant.resolution) {
        const pixels = variant.resolution.width * variant.resolution.height;
        const minPixels = getMinPixels(minResolution);
        if (pixels < minPixels) {
          return false;
        }
      }

      return true;
    });
  }, [variants, searchTerm, filterType, minBitrate, maxBitrate, selectedCodec, minResolution]);

  // Update parent when filters change
  useMemo(() => {
    onFilteredChange(filteredVariants);
  }, [filteredVariants, onFilteredChange]);

  // Calculate bitrate range
  const bitrateRange = useMemo(() => {
    const bitrates = variants.map(v => v.bitrate);
    return {
      min: Math.min(...bitrates),
      max: Math.max(...bitrates)
    };
  }, [variants]);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Search & Filter
        </h2>
        <div className="text-sm text-gray-600">
          Showing {filteredVariants.length} of {variants.length} variants
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by URL, ID, or codec..."
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Type Filter */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="video">Video Only</option>
            <option value="audio">Audio Only</option>
            <option value="subtitle">Subtitles Only</option>
          </select>
        </div>

        {/* Codec Filter */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Codec</label>
          <select
            value={selectedCodec}
            onChange={(e) => setSelectedCodec(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Codecs</option>
            {allCodecs.map(codec => (
              <option key={codec} value={codec}>{codec}</option>
            ))}
          </select>
        </div>

        {/* Resolution Filter */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Min Resolution</label>
          <select
            value={minResolution}
            onChange={(e) => setMinResolution(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Any Resolution</option>
            <option value="4k">4K (3840x2160)</option>
            <option value="1080p">1080p (1920x1080)</option>
            <option value="720p">720p (1280x720)</option>
            <option value="480p">480p (854x480)</option>
            <option value="360p">360p (640x360)</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setMinBitrate(0);
              setMaxBitrate(Number.MAX_SAFE_INTEGER);
              setSelectedCodec('all');
              setMinResolution('all');
            }}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Bitrate Range Slider */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">
          Bitrate Range: {formatBitrate(minBitrate)} - {maxBitrate === Number.MAX_SAFE_INTEGER ? '∞' : formatBitrate(maxBitrate)}
        </label>
        <div className="flex gap-3 items-center">
          <span className="text-xs text-gray-500">Min</span>
          <input
            type="range"
            min={bitrateRange.min}
            max={bitrateRange.max}
            step={100000}
            value={minBitrate}
            onChange={(e) => setMinBitrate(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-20 text-right">
            {formatBitrate(minBitrate)}
          </span>
        </div>
        <div className="flex gap-3 items-center mt-2">
          <span className="text-xs text-gray-500">Max</span>
          <input
            type="range"
            min={bitrateRange.min}
            max={bitrateRange.max}
            step={100000}
            value={maxBitrate === Number.MAX_SAFE_INTEGER ? bitrateRange.max : maxBitrate}
            onChange={(e) => setMaxBitrate(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-20 text-right">
            {maxBitrate === Number.MAX_SAFE_INTEGER ? '∞' : formatBitrate(maxBitrate)}
          </span>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(searchTerm || filterType !== 'all' || selectedCodec !== 'all' || minResolution !== 'all' ||
        minBitrate > 0 || maxBitrate < Number.MAX_SAFE_INTEGER) && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Search: "{searchTerm}"
            </span>
          )}
          {filterType !== 'all' && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
              Type: {filterType}
            </span>
          )}
          {selectedCodec !== 'all' && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              Codec: {selectedCodec}
            </span>
          )}
          {minResolution !== 'all' && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
              Min: {minResolution}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function formatBitrate(bps: number): string {
  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(1)} Mbps`;
  }
  return `${(bps / 1000).toFixed(0)} Kbps`;
}

function getMinPixels(resolution: string): number {
  const resolutions: Record<string, number> = {
    '4k': 3840 * 2160,
    '1080p': 1920 * 1080,
    '720p': 1280 * 720,
    '480p': 854 * 480,
    '360p': 640 * 360
  };

  return resolutions[resolution] || 0;
}
