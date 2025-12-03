// Validation Sidebar - Right side of Spec Validator Mode
// Shows compliance status, playlist type, features, and issues

import type { ParsedManifest } from '../../types/manifest';
import { ValidationIssueList } from './ValidationIssueList';
import { PlaylistTypeBadge } from './PlaylistTypeBadge';

interface Props {
  manifest: ParsedManifest;
}

export function ValidationSidebar({ manifest }: Props) {
  const validation = manifest.validation;

  if (!validation) {
    return (
      <div className="h-full p-4">
        <div className="text-sm text-gray-500">Validation not available</div>
      </div>
    );
  }

  const { compliant, errors, warnings, info } = validation;

  return (
    <div className="h-full overflow-y-auto">
      {/* Compliance Status */}
      <div className="p-4 border-b border-gray-200">
        {compliant ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <span className="text-3xl">✅</span>
            <div>
              <div className="font-bold text-green-900">SPEC COMPLIANT</div>
              <div className="text-sm text-green-700">No errors found</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <span className="text-3xl">❌</span>
            <div>
              <div className="font-bold text-red-900">NON-COMPLIANT</div>
              <div className="text-sm text-red-700">
                {errors.length} error{errors.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-900">
              ⚠️ {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Playlist Type */}
      <div className="p-4 border-b border-gray-200">
        <PlaylistTypeBadge validation={validation} format={manifest.format} />
      </div>

      {/* Features Detected */}
      {validation.detectedFeatures && validation.detectedFeatures.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">🔍 Features Detected</h3>
          <div className="space-y-2">
            {validation.detectedFeatures.map((feature, index) => (
              <div
                key={index}
                className={`text-sm ${feature.detected ? 'text-green-700' : 'text-gray-400'}`}
              >
                {feature.detected ? '✓' : '○'} {feature.name}
                {feature.version && ` (v${feature.version}+)`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Issues */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="p-4">
          <ValidationIssueList
            errors={errors}
            warnings={warnings}
            info={info}
          />
        </div>
      )}

      {/* No issues message */}
      {compliant && warnings.length === 0 && info.length === 0 && (
        <div className="p-4 text-sm text-gray-600">
          <p>This manifest is fully compliant with the specification.</p>
          <p className="mt-2">No errors, warnings, or informational messages.</p>
        </div>
      )}
    </div>
  );
}
