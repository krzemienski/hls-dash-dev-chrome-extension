// src/components/viewer/StructuredView.tsx
import type { ParsedManifest } from '../../types/manifest';
import { VariantList } from './VariantList';

interface StructuredViewProps {
  manifest: ParsedManifest;
}

export function StructuredView({ manifest }: StructuredViewProps) {
  return (
    <div className="space-y-6">
      {/* Metadata Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Metadata</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-600">Format</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {manifest.format.toUpperCase()}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600">Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {manifest.metadata.type}
            </dd>
          </div>

          {manifest.metadata.version && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Version</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {manifest.metadata.version}
              </dd>
            </div>
          )}

          {manifest.metadata.duration && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDuration(manifest.metadata.duration)}
              </dd>
            </div>
          )}

          {manifest.metadata.targetDuration && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Target Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {manifest.metadata.targetDuration}s
              </dd>
            </div>
          )}

          {manifest.metadata.minBufferTime && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Min Buffer Time</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {manifest.metadata.minBufferTime}s
              </dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-gray-600">Encrypted</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {manifest.metadata.encrypted ? (
                <span className="text-red-600">🔒 Yes</span>
              ) : (
                <span className="text-green-600">✓ No</span>
              )}
            </dd>
          </div>

          {manifest.metadata.profiles && manifest.metadata.profiles.length > 0 && (
            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-600">Profiles</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {manifest.metadata.profiles.join(', ')}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Variants Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Adaptive Bitrate Variants
        </h2>
        <VariantList variants={manifest.variants} />
      </section>

      {/* Segments Section (if present) */}
      {manifest.segments && manifest.segments.length > 0 && (
        <section className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Segments ({manifest.segments.length})
          </h2>
          <div className="text-sm text-gray-600">
            <div>First segment: {manifest.segments[0].url}</div>
            <div className="mt-2">
              Average duration: {(
                manifest.segments.reduce((sum, s) => sum + s.duration, 0) /
                manifest.segments.length
              ).toFixed(2)}s
            </div>
          </div>
        </section>
      )}
    </div>
  );
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
