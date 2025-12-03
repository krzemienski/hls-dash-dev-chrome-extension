// src/components/viewer/VariantDetailModal.tsx
import type { Variant } from '../../types/manifest';

interface VariantDetailModalProps {
  variant: Variant;
  onClose: () => void;
}

export function VariantDetailModal({ variant, onClose }: VariantDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Variant Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Type Badge */}
          <div>
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              variant.type === 'video' ? 'bg-purple-100 text-purple-700' :
              variant.type === 'audio' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {variant.type.toUpperCase()}
            </span>
          </div>

          {/* Details Grid */}
          <dl className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-gray-50 p-4 rounded">
              <dt className="text-sm font-medium text-gray-600 mb-1">ID</dt>
              <dd className="text-sm text-gray-900 font-mono">{variant.id}</dd>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <dt className="text-sm font-medium text-gray-600 mb-1">Bitrate</dt>
              <dd className="text-lg font-bold text-gray-900">
                {formatBitrate(variant.bitrate)}
              </dd>
              <dd className="text-xs text-gray-500 mt-1">
                {variant.bitrate.toLocaleString()} bps
              </dd>
            </div>

            {variant.resolution && (
              <div className="bg-gray-50 p-4 rounded">
                <dt className="text-sm font-medium text-gray-600 mb-1">Resolution</dt>
                <dd className="text-lg font-bold text-gray-900">
                  {variant.resolution.width}x{variant.resolution.height}
                </dd>
                <dd className="text-xs text-gray-500 mt-1">
                  {getAspectRatio(variant.resolution.width, variant.resolution.height)}
                </dd>
              </div>
            )}

            {variant.frameRate && (
              <div className="bg-gray-50 p-4 rounded">
                <dt className="text-sm font-medium text-gray-600 mb-1">Frame Rate</dt>
                <dd className="text-lg font-bold text-gray-900">
                  {variant.frameRate} fps
                </dd>
              </div>
            )}

            <div className={`bg-gray-50 p-4 rounded ${!variant.frameRate && variant.resolution ? '' : 'col-span-2'}`}>
              <dt className="text-sm font-medium text-gray-600 mb-1">Codecs</dt>
              <dd className="text-sm text-gray-900 font-mono">
                {variant.codecs.length > 0 ? variant.codecs.join(', ') : 'Not specified'}
              </dd>
            </div>

            <div className="col-span-2 bg-gray-50 p-4 rounded">
              <dt className="text-sm font-medium text-gray-600 mb-1">Playlist URL</dt>
              <dd className="text-sm text-gray-900 font-mono break-all">
                {variant.url}
              </dd>
              <button
                onClick={() => navigator.clipboard.writeText(variant.url)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Copy URL
              </button>
            </div>
          </dl>

          {/* Estimated Data Usage */}
          {variant.bitrate > 0 && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Estimated Data Usage
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-blue-600">1 minute</div>
                  <div className="font-semibold text-blue-900">
                    {formatBytes((variant.bitrate / 8) * 60)}
                  </div>
                </div>
                <div>
                  <div className="text-blue-600">10 minutes</div>
                  <div className="font-semibold text-blue-900">
                    {formatBytes((variant.bitrate / 8) * 600)}
                  </div>
                </div>
                <div>
                  <div className="text-blue-600">1 hour</div>
                  <div className="font-semibold text-blue-900">
                    {formatBytes((variant.bitrate / 8) * 3600)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
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

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}
