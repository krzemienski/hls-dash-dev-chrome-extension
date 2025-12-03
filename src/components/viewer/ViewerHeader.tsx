// src/components/viewer/ViewerHeader.tsx
import { useManifestStore } from '../../store/manifest-store';
import { ExportMenu } from './ExportMenu';

export function ViewerHeader() {
  const manifest = useManifestStore((state) => state.manifest);
  const selectedView = useManifestStore((state) => state.selectedView);
  const setSelectedView = useManifestStore((state) => state.setSelectedView);
  const viewMode = useManifestStore((state) => state.viewMode);
  const setViewMode = useManifestStore((state) => state.setViewMode);

  if (!manifest) {
    return null;
  }

  const handleModeToggle = () => {
    setViewMode(viewMode === 'spec' ? 'analysis' : 'spec');
  };

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

        <div className="flex gap-4 items-center">
          {/* Mode Toggle Button */}
          <button
            onClick={handleModeToggle}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
          >
            {viewMode === 'spec' ? (
              <>
                <span>→ Deep Analysis</span>
              </>
            ) : (
              <>
                <span>← Spec Validator</span>
              </>
            )}
          </button>

          {/* View tabs (only in Analysis mode) */}
          {viewMode === 'analysis' && (
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
          )}

          {viewMode === 'analysis' && <ExportMenu manifest={manifest} />}
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
