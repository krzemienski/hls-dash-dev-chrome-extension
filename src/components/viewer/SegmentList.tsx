// src/components/viewer/SegmentList.tsx
import { useState } from 'react';
import type { Segment } from '../../types/manifest';

interface SegmentListProps {
  segments: Segment[];
}

export function SegmentList({ segments }: SegmentListProps) {
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  if (segments.length === 0) {
    return null;
  }

  const toggleSegment = (segmentId: string) => {
    const newExpanded = new Set(expandedSegments);
    if (newExpanded.has(segmentId)) {
      newExpanded.delete(segmentId);
    } else {
      newExpanded.add(segmentId);
    }
    setExpandedSegments(newExpanded);
  };

  const displaySegments = showAll ? segments : segments.slice(0, 10);

  // Calculate statistics
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
  const avgDuration = totalDuration / segments.length;
  const minDuration = Math.min(...segments.map(s => s.duration));
  const maxDuration = Math.max(...segments.map(s => s.duration));

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Segments ({segments.length})
        </h2>

        {segments.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showAll ? 'Show Less' : `Show All (${segments.length})`}
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-xs text-blue-600">TOTAL DURATION</div>
          <div className="text-sm font-bold text-blue-900 mt-1">
            {totalDuration.toFixed(2)}s
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-xs text-green-600">AVERAGE</div>
          <div className="text-sm font-bold text-green-900 mt-1">
            {avgDuration.toFixed(2)}s
          </div>
        </div>
        <div className="bg-orange-50 p-3 rounded">
          <div className="text-xs text-orange-600">MIN</div>
          <div className="text-sm font-bold text-orange-900 mt-1">
            {minDuration.toFixed(2)}s
          </div>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-xs text-purple-600">MAX</div>
          <div className="text-sm font-bold text-purple-900 mt-1">
            {maxDuration.toFixed(2)}s
          </div>
        </div>
      </div>

      {/* Segment List */}
      <div className="space-y-2">
        {displaySegments.map((segment) => {
          const isExpanded = expandedSegments.has(segment.id);

          return (
            <div
              key={segment.id}
              className="border border-gray-200 rounded overflow-hidden"
            >
              <div
                onClick={() => toggleSegment(segment.id)}
                className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-600 w-16">
                    #{segment.sequence}
                  </span>
                  <span className="text-sm text-gray-900">
                    Duration: {segment.duration.toFixed(2)}s
                  </span>
                </div>

                <button className="text-gray-400">
                  {isExpanded ? '▼' : '▶'}
                </button>
              </div>

              {isExpanded && (
                <div className="p-3 bg-white border-t border-gray-200 space-y-2">
                  <div>
                    <div className="text-xs text-gray-600">URL</div>
                    <div className="text-sm text-gray-900 font-mono break-all">
                      {segment.url}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(segment.url)}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      Copy URL
                    </button>
                  </div>

                  {segment.byteRange && (
                    <div>
                      <div className="text-xs text-gray-600">Byte Range</div>
                      <div className="text-sm text-gray-900 font-mono">
                        {segment.byteRange.start} - {segment.byteRange.end}
                        <span className="ml-2 text-gray-500">
                          ({(segment.byteRange.end - segment.byteRange.start).toLocaleString()} bytes)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showAll && segments.length > 10 && (
        <div className="mt-3 text-center text-sm text-gray-500">
          Showing 10 of {segments.length} segments
        </div>
      )}
    </div>
  );
}
