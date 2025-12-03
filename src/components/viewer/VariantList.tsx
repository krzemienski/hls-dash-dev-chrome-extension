// src/components/viewer/VariantList.tsx
import { useState } from 'react';
import type { Variant } from '../../types/manifest';
import { useManifestStore } from '../../store/manifest-store';
import { VariantDetailModal } from './VariantDetailModal';

interface VariantListProps {
  variants: Variant[];
}

export function VariantList({ variants }: VariantListProps) {
  const selectedVariantId = useManifestStore((state) => state.selectedVariantId);
  const setSelectedVariant = useManifestStore((state) => state.setSelectedVariant);
  const [detailVariant, setDetailVariant] = useState<Variant | null>(null);

  // Group variants by type
  const videoVariants = variants.filter(v => v.type === 'video');
  const audioVariants = variants.filter(v => v.type === 'audio');
  const subtitleVariants = variants.filter(v => v.type === 'subtitle');

  return (
    <div className="space-y-6">
      {/* Video Variants */}
      {videoVariants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Video Variants ({videoVariants.length})
          </h3>
          <div className="space-y-2">
            {videoVariants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                selected={variant.id === selectedVariantId}
                onSelect={() => setSelectedVariant(variant.id)}
                onShowDetails={() => setDetailVariant(variant)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Audio Variants */}
      {audioVariants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Audio Variants ({audioVariants.length})
          </h3>
          <div className="space-y-2">
            {audioVariants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                selected={variant.id === selectedVariantId}
                onSelect={() => setSelectedVariant(variant.id)}
                onShowDetails={() => setDetailVariant(variant)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subtitle Variants */}
      {subtitleVariants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Subtitle Variants ({subtitleVariants.length})
          </h3>
          <div className="space-y-2">
            {subtitleVariants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                selected={variant.id === selectedVariantId}
                onSelect={() => setSelectedVariant(variant.id)}
                onShowDetails={() => setDetailVariant(variant)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailVariant && (
        <VariantDetailModal
          variant={detailVariant}
          onClose={() => setDetailVariant(null)}
        />
      )}
    </div>
  );
}

interface VariantCardProps {
  variant: Variant;
  selected: boolean;
  onSelect: () => void;
  onShowDetails: () => void;
}

function VariantCard({ variant, selected, onSelect, onShowDetails }: VariantCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Bitrate */}
          <div className="font-semibold text-gray-900">
            {formatBitrate(variant.bitrate)}
          </div>

          {/* Resolution */}
          {variant.resolution && (
            <div className="text-sm text-gray-600 mt-1">
              {variant.resolution.width}x{variant.resolution.height}
              {variant.frameRate && ` @ ${variant.frameRate}fps`}
            </div>
          )}

          {/* Codecs */}
          <div className="text-xs text-gray-500 mt-2 font-mono">
            {variant.codecs.join(', ')}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Type badge */}
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            variant.type === 'video' ? 'bg-purple-100 text-purple-700' :
            variant.type === 'audio' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {variant.type}
          </span>

          {/* Details button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails();
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          >
            Details
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
