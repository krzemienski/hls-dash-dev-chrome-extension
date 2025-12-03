// Validation Issue List Component
// Displays errors, warnings, and info messages

import type { ValidationIssue } from '../../types/validation';

interface Props {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
}

export function ValidationIssueList({ errors, warnings, info }: Props) {
  const renderIssue = (issue: ValidationIssue, index: number) => {
    const severityColors = {
      error: 'bg-red-50 border-red-200 text-red-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900'
    };

    const severityIcons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    return (
      <div
        key={`${issue.severity}-${index}`}
        className={`border rounded-lg p-3 mb-3 ${severityColors[issue.severity]}`}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">{severityIcons[issue.severity]}</span>
          <div className="flex-1">
            {/* Issue header */}
            <div className="font-semibold text-sm mb-1">
              {issue.tag || issue.element || issue.code}
              {issue.line && ` (Line ${issue.line})`}
            </div>

            {/* Message */}
            <div className="text-sm mb-2">{issue.message}</div>

            {/* Suggestion */}
            {issue.suggestion && (
              <div className="text-xs bg-white bg-opacity-50 rounded p-2 mb-2">
                <span className="font-semibold">Suggestion:</span> {issue.suggestion}
              </div>
            )}

            {/* Spec reference */}
            <div className="text-xs">
              <span className="font-semibold">Spec:</span>{' '}
              {issue.specUrl ? (
                <a
                  href={issue.specUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  {issue.specReference} ↗
                </a>
              ) : (
                issue.specReference
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-red-900 mb-2">
            ❌ Errors ({errors.length})
          </h3>
          {errors.map((error, index) => renderIssue(error, index))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            ⚠️ Warnings ({warnings.length})
          </h3>
          {warnings.map((warning, index) => renderIssue(warning, index))}
        </div>
      )}

      {/* Info */}
      {info.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ℹ️ Info ({info.length})
          </h3>
          {info.map((infoItem, index) => renderIssue(infoItem, index))}
        </div>
      )}
    </div>
  );
}
