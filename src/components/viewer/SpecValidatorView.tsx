// Spec Validator Mode - Main Container
// Displays raw manifest with validation sidebar

import { useManifestStore } from '../../store/manifest-store';
import { RawManifestPanel } from './RawManifestPanel';
import { ValidationSidebar } from './ValidationSidebar';

export function SpecValidatorView() {
  const manifest = useManifestStore(state => state.manifest);
  const loading = useManifestStore(state => state.loading);
  const error = useManifestStore(state => state.error);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">Loading manifest...</div>
          <div className="text-sm text-gray-500 mt-2">Validating against spec</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-2xl bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Manifest</h2>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Manifest Loaded</h2>
          <p className="text-gray-600">Click a .m3u8 or .mpd URL to view it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left: Raw manifest (70%) */}
      <div className="w-[70%] border-r border-gray-300">
        <RawManifestPanel manifest={manifest} />
      </div>

      {/* Right: Validation sidebar (30%) */}
      <div className="w-[30%] bg-white">
        <ValidationSidebar manifest={manifest} />
      </div>
    </div>
  );
}
