// src/components/viewer/ProtocolInfoPanel.tsx
import type { ParsedManifest } from '../../types/manifest';
import {
  analyzeHLSProtocol,
  analyzeDASHProtocol,
  getProtocolCapabilities
} from '../../lib/utils/streaming-protocol';

interface ProtocolInfoPanelProps {
  manifest: ParsedManifest;
}

export function ProtocolInfoPanel({ manifest }: ProtocolInfoPanelProps) {
  const isHLS = manifest.format === 'hls';
  const isDASH = manifest.format === 'dash';

  const hlsAnalysis = isHLS ? analyzeHLSProtocol(manifest.raw) : null;
  const dashAnalysis = isDASH ? analyzeDASHProtocol(manifest.raw) : null;

  const capabilities = getProtocolCapabilities(
    isHLS ? 'HLS' : 'DASH',
    hlsAnalysis?.version || undefined
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Streaming Protocol Details
      </h2>

      {/* Protocol Header */}
      <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-indigo-900">
              {isHLS ? 'HTTP Live Streaming (HLS)' : 'Dynamic Adaptive Streaming over HTTP (DASH)'}
            </h3>
            {hlsAnalysis?.version && (
              <div className="text-sm text-indigo-700 mt-1">
                Version {hlsAnalysis.version}
              </div>
            )}
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold text-white ${
            isHLS ? 'bg-green-600' : 'bg-purple-600'
          }`}>
            {manifest.format.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Detected Features
        </h3>
        <div className="flex flex-wrap gap-2">
          {(hlsAnalysis?.features || dashAnalysis?.features || []).map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* HLS-Specific */}
      {hlsAnalysis && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-3 rounded border ${
            hlsAnalysis.hasIndependentSegments
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="text-xs text-gray-600">Independent Segments</div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {hlsAnalysis.hasIndependentSegments ? '✓ Yes' : '✗ No'}
            </div>
          </div>

          <div className={`p-3 rounded border ${
            hlsAnalysis.supportsLowLatency
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="text-xs text-gray-600">Low Latency Support</div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {hlsAnalysis.supportsLowLatency ? '✓ Yes' : '✗ No'}
            </div>
          </div>

          <div className={`p-3 rounded border ${
            hlsAnalysis.usesByteRange
              ? 'bg-blue-50 border-blue-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="text-xs text-gray-600">Byte Range</div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {hlsAnalysis.usesByteRange ? '✓ Yes' : '✗ No'}
            </div>
          </div>

          <div className={`p-3 rounded border ${
            hlsAnalysis.hasVariableGOP
              ? 'bg-blue-50 border-blue-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="text-xs text-gray-600">Variable GOP</div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {hlsAnalysis.hasVariableGOP ? '✓ Yes' : '✗ No'}
            </div>
          </div>
        </div>
      )}

      {/* DASH-Specific */}
      {dashAnalysis && (
        <>
          {dashAnalysis.profiles.length > 0 && (
            <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-xs text-purple-600 font-medium mb-2">DASH PROFILES</div>
              <div className="flex flex-wrap gap-2">
                {dashAnalysis.profiles.map((profile, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-mono">
                    {profile}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-3 rounded border ${
              dashAnalysis.usesSegmentTemplate
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-xs text-gray-600">Segment Template</div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {dashAnalysis.usesSegmentTemplate ? '✓ Yes' : '✗ No'}
              </div>
            </div>

            <div className={`p-3 rounded border ${
              dashAnalysis.supportsDynamicManifests
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-xs text-gray-600">Dynamic Manifest</div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {dashAnalysis.supportsDynamicManifests ? '✓ Yes' : '✗ No'}
              </div>
            </div>

            <div className={`p-3 rounded border ${
              dashAnalysis.hasBaseURL
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-xs text-gray-600">Base URL</div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {dashAnalysis.hasBaseURL ? '✓ Yes' : '✗ No'}
              </div>
            </div>

            <div className={`p-3 rounded border ${
              dashAnalysis.usesSegmentList
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-xs text-gray-600">Segment List</div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {dashAnalysis.usesSegmentList ? '✓ Yes' : '✗ No'}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Protocol Capabilities */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Protocol Capabilities
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className={capabilities.supportsLiveStreaming ? 'text-green-600' : 'text-gray-400'}>
              {capabilities.supportsLiveStreaming ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Live Streaming</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={capabilities.supportsVOD ? 'text-green-600' : 'text-gray-400'}>
              {capabilities.supportsVOD ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Video on Demand</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={capabilities.supportsLowLatency ? 'text-green-600' : 'text-gray-400'}>
              {capabilities.supportsLowLatency ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Low Latency</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={capabilities.supportsByteRangeRequests ? 'text-green-600' : 'text-gray-400'}>
              {capabilities.supportsByteRangeRequests ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Byte Range Requests</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={capabilities.supportsIFrameTrickPlay ? 'text-green-600' : 'text-gray-400'}>
              {capabilities.supportsIFrameTrickPlay ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">I-Frame Trick Play</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={capabilities.multiCodecSupport ? 'text-green-600' : 'text-gray-400'}>
              {capabilities.multiCodecSupport ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Multi-Codec Support</span>
          </div>
        </div>
      </div>

      {/* Educational Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          ℹ About {isHLS ? 'HLS' : 'DASH'}
        </h3>
        <p className="text-sm text-blue-800">
          {isHLS ? (
            <>
              HLS (HTTP Live Streaming) is Apple's adaptive streaming protocol. It breaks content
              into small HTTP-based file downloads, supports live and on-demand streaming, and works
              across all major platforms. HLS version 7+ includes Low Latency features for
              near-real-time streaming.
            </>
          ) : (
            <>
              DASH (Dynamic Adaptive Streaming over HTTP) is an international standard for adaptive
              bitrate streaming. It's codec-agnostic, supports both live and on-demand content, and
              provides flexible manifest structure. DASH is royalty-free and widely supported across
              platforms.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
