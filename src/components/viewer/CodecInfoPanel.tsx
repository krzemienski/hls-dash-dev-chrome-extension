// src/components/viewer/CodecInfoPanel.tsx
import type { ParsedManifest } from '../../types/manifest';
import { analyzeCodecs, getCodecInfo, parseCodec } from '../../lib/utils/codec-analyzer';

interface CodecInfoPanelProps {
  manifest: ParsedManifest;
}

export function CodecInfoPanel({ manifest }: CodecInfoPanelProps) {
  // Collect all unique codecs
  const allCodecs = new Set<string>();
  manifest.variants.forEach(v => {
    v.codecs.forEach(c => allCodecs.add(c));
  });

  const codecArray = Array.from(allCodecs);
  const analysis = analyzeCodecs(codecArray);

  if (codecArray.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Codec Analysis
      </h2>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {analysis.hasModernCodecs && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            ✓ Modern Codecs
          </span>
        )}
        {analysis.hasHDR && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            HDR Support
          </span>
        )}
        {analysis.videoCodecs.length > 0 && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {analysis.videoCodecs.length} Video Codec{analysis.videoCodecs.length > 1 ? 's' : ''}
          </span>
        )}
        {analysis.audioCodecs.length > 0 && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            {analysis.audioCodecs.length} Audio Codec{analysis.audioCodecs.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Codec Details */}
      <div className="space-y-3">
        {codecArray.map((codecString) => {
          const parsed = parseCodec(codecString);
          const info = getCodecInfo(codecString);

          return (
            <div
              key={codecString}
              className="p-4 bg-gray-50 rounded border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {parsed.codec}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      info.isVideo ? 'bg-blue-100 text-blue-700' :
                      info.isAudio ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {info.isVideo ? 'Video' : info.isAudio ? 'Audio' : 'Subtitle'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {info.description}
                  </p>

                  <div className="flex gap-4 text-xs text-gray-500">
                    {parsed.profile && (
                      <div>
                        <span className="font-medium">Profile:</span> {parsed.profile}
                      </div>
                    )}
                    {parsed.level && (
                      <div>
                        <span className="font-medium">Level:</span> {parsed.level}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    {codecString}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compatibility Notes */}
      {!analysis.hasModernCodecs && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="text-sm font-semibold text-blue-900 mb-1">
            💡 Optimization Tip
          </h4>
          <p className="text-xs text-blue-800">
            Consider adding modern codecs (AV1, VP9) for better compression and bandwidth savings.
            These can coexist with H.264/H.265 for backwards compatibility.
          </p>
        </div>
      )}
    </div>
  );
}
