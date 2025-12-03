// src/components/viewer/ValidationReport.tsx
import type { ParsedManifest } from '../../types/manifest';
import { validateManifest, getValidationSummary } from '../../lib/validation/manifest-validator';

interface ValidationReportProps {
  manifest: ParsedManifest;
}

export function ValidationReport({ manifest }: ValidationReportProps) {
  const issues = validateManifest(manifest);
  const summary = getValidationSummary(issues);

  if (issues.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✓</span>
          <div>
            <h3 className="font-semibold text-green-900">
              Manifest is healthy
            </h3>
            <p className="text-sm text-green-700">
              No validation issues detected
            </p>
          </div>
        </div>
      </div>
    );
  }

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const info = issues.filter(i => i.severity === 'info');

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Validation Report
      </h2>

      {/* Summary */}
      <div className="flex gap-4 mb-6">
        {summary.errors > 0 && (
          <div className="bg-red-50 px-4 py-2 rounded">
            <span className="text-red-700 font-semibold">{summary.errors}</span>
            <span className="text-red-600 text-sm ml-2">
              {summary.errors === 1 ? 'Error' : 'Errors'}
            </span>
          </div>
        )}

        {summary.warnings > 0 && (
          <div className="bg-orange-50 px-4 py-2 rounded">
            <span className="text-orange-700 font-semibold">{summary.warnings}</span>
            <span className="text-orange-600 text-sm ml-2">
              {summary.warnings === 1 ? 'Warning' : 'Warnings'}
            </span>
          </div>
        )}

        {summary.info > 0 && (
          <div className="bg-blue-50 px-4 py-2 rounded">
            <span className="text-blue-700 font-semibold">{summary.info}</span>
            <span className="text-blue-600 text-sm ml-2">
              {summary.info === 1 ? 'Info' : 'Info'}
            </span>
          </div>
        )}
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {/* Errors */}
        {errors.map((issue, index) => (
          <div
            key={`error-${index}`}
            className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded"
          >
            <span className="text-red-600 font-bold">✗</span>
            <div className="flex-1">
              <div className="font-medium text-red-900">{issue.message}</div>
              <div className="text-xs text-red-600 mt-1">
                Category: {issue.category}
              </div>
            </div>
          </div>
        ))}

        {/* Warnings */}
        {warnings.map((issue, index) => (
          <div
            key={`warning-${index}`}
            className="flex gap-3 p-3 bg-orange-50 border border-orange-200 rounded"
          >
            <span className="text-orange-600 font-bold">⚠</span>
            <div className="flex-1">
              <div className="font-medium text-orange-900">{issue.message}</div>
              <div className="text-xs text-orange-600 mt-1">
                Category: {issue.category}
              </div>
            </div>
          </div>
        ))}

        {/* Info */}
        {info.map((issue, index) => (
          <div
            key={`info-${index}`}
            className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded"
          >
            <span className="text-blue-600 font-bold">ℹ</span>
            <div className="flex-1">
              <div className="font-medium text-blue-900">{issue.message}</div>
              <div className="text-xs text-blue-600 mt-1">
                Category: {issue.category}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
