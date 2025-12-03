// src/components/viewer/PerformanceMetrics.tsx
import type { ParsedManifest } from '../../types/manifest';
import { calculatePerformanceMetrics } from '../../lib/utils/performance-metrics';

interface PerformanceMetricsProps {
  manifest: ParsedManifest;
}

export function PerformanceMetrics({ manifest }: PerformanceMetricsProps) {
  const metrics = calculatePerformanceMetrics(manifest);
  const videoVariants = manifest.variants.filter(v => v.type === 'video');

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Performance Analysis
      </h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">STARTUP LATENCY</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {metrics.startupLatency.toFixed(1)}s
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Time to first frame
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded border border-purple-200">
          <div className="text-xs text-purple-600 font-medium">SWITCH LATENCY</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {metrics.switchingLatency.toFixed(1)}s
          </div>
          <div className="text-xs text-purple-700 mt-1">
            Quality switch time
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded border border-orange-200">
          <div className="text-xs text-orange-600 font-medium">BUFFER REQUIRED</div>
          <div className="text-2xl font-bold text-orange-900 mt-1">
            {metrics.bufferRequirement.toFixed(1)}s
          </div>
          <div className="text-xs text-orange-700 mt-1">
            Recommended buffer
          </div>
        </div>

        <div className={`p-4 rounded border ${getScoreBg(metrics.bandwidthEfficiency)}`}>
          <div className={`text-xs font-medium ${getScoreColor(metrics.bandwidthEfficiency)}`}>
            EFFICIENCY SCORE
          </div>
          <div className={`text-2xl font-bold mt-1 ${getScoreColor(metrics.bandwidthEfficiency)}`}>
            {metrics.bandwidthEfficiency.toFixed(0)}
          </div>
          <div className={`text-xs mt-1 ${getScoreColor(metrics.bandwidthEfficiency)}`}>
            Bitrate ladder quality
          </div>
        </div>
      </div>

      {/* Quality Consistency Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Quality Consistency
          </span>
          <span className={`text-sm font-bold ${getScoreColor(metrics.qualityConsistency)}`}>
            {metrics.qualityConsistency.toFixed(0)}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              metrics.qualityConsistency >= 80 ? 'bg-green-600' :
              metrics.qualityConsistency >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${metrics.qualityConsistency}%` }}
          />
        </div>
      </div>

      {/* Recommendations */}
      {metrics.recommendations.length > 0 && (
        <div className={`border rounded p-4 ${
          metrics.recommendations[0].includes('good') || metrics.recommendations[0].includes('Good')
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            metrics.recommendations[0].includes('good') || metrics.recommendations[0].includes('Good')
              ? 'text-green-900'
              : 'text-yellow-900'
          }`}>
            Performance Recommendations
          </h3>
          <ul className={`text-sm space-y-1 ${
            metrics.recommendations[0].includes('good') || metrics.recommendations[0].includes('Good')
              ? 'text-green-800'
              : 'text-yellow-800'
          }`}>
            {metrics.recommendations.map((rec, index) => (
              <li key={index}>
                {metrics.recommendations[0].includes('good') || metrics.recommendations[0].includes('Good') ? '✓' : '•'} {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Technical Details
        </h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-600">Segment Duration</dt>
            <dd className="text-gray-900 font-semibold mt-1">
              {manifest.metadata.targetDuration || 'N/A'}
              {manifest.metadata.targetDuration && 's'}
            </dd>
          </div>

          {manifest.metadata.minBufferTime && (
            <div>
              <dt className="text-gray-600">Min Buffer Time</dt>
              <dd className="text-gray-900 font-semibold mt-1">
                {manifest.metadata.minBufferTime}s
              </dd>
            </div>
          )}

          <div>
            <dt className="text-gray-600">Variant Count</dt>
            <dd className="text-gray-900 font-semibold mt-1">
              {videoVariants.length}
            </dd>
          </div>

          <div>
            <dt className="text-gray-600">Format</dt>
            <dd className="text-gray-900 font-semibold mt-1">
              {manifest.format.toUpperCase()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
