// src/components/viewer/ViewerHeader.tsx
import { useManifestStore } from '../../store/manifest-store';

export function ViewerHeader() {
  const manifest = useManifestStore((state) => state.manifest);
  const selectedView = useManifestStore((state) => state.selectedView);
  const setSelectedView = useManifestStore((state) => state.setSelectedView);

  if (!manifest) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {manifest.format.toUpperCase()} Manifest Viewer
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {manifest.url}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('raw')}
            className={`px-4 py-2 rounded ${
              selectedView === 'raw'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Raw
          </button>
          <button
            onClick={() => setSelectedView('structured')}
            className={`px-4 py-2 rounded ${
              selectedView === 'structured'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Structured
          </button>
          <button
            onClick={() => setSelectedView('timeline')}
            className={`px-4 py-2 rounded ${
              selectedView === 'timeline'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Metadata summary */}
      <div className="mt-4 flex gap-6 text-sm text-gray-600">
        <div>
          <span className="font-medium">Type:</span> {manifest.metadata.type}
        </div>
        {manifest.metadata.duration && (
          <div>
            <span className="font-medium">Duration:</span>{' '}
            {manifest.metadata.duration.toFixed(2)}s
          </div>
        )}
        <div>
          <span className="font-medium">Variants:</span> {manifest.variants.length}
        </div>
        {manifest.metadata.encrypted && (
          <div className="text-red-600">
            <span className="font-medium">🔒 Encrypted</span>
          </div>
        )}
      </div>
    </header>
  );
}
