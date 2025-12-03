// src/lib/utils/streaming-protocol.ts

export type StreamingProtocol = 'HLS' | 'DASH' | 'Unknown';

export interface HLSProtocolAnalysis {
  version: number | null;
  hasIndependentSegments: boolean;
  hasIFramesOnly: boolean;
  usesByteRange: boolean;
  hasDiscontinuities: boolean;
  hasVariableGOP: boolean;
  supportsLowLatency: boolean; // Version 9+
  features: string[];
}

export interface DASHProtocolAnalysis {
  profiles: string[];
  usesSegmentTemplate: boolean;
  usesSegmentList: boolean;
  usesSegmentBase: boolean;
  hasBaseURL: boolean;
  supportsDynamicManifests: boolean;
  features: string[];
}

export interface ProtocolCapabilities {
  supportsLiveStreaming: boolean;
  supportsVOD: boolean;
  supportsLowLatency: boolean;
  supportsDynamicManifests: boolean;
  supportsVariableGOP: boolean;
  supportsByteRangeRequests: boolean;
  supportsIFrameTrickPlay: boolean;
  maxSupportedBitrate: string;
  multiCodecSupport: boolean;
}

/**
 * Detect streaming protocol from manifest content
 */
export function detectStreamingProtocol(content: string): StreamingProtocol {
  const trimmed = content.trimStart();

  if (trimmed.startsWith('#EXTM3U')) {
    return 'HLS';
  }

  if (trimmed.startsWith('<') || trimmed.includes('<MPD')) {
    return 'DASH';
  }

  return 'Unknown';
}

/**
 * Analyze HLS protocol features
 */
export function analyzeHLSProtocol(content: string): HLSProtocolAnalysis {
  const features: string[] = [];

  // Extract version
  const versionMatch = content.match(/#EXT-X-VERSION:(\d+)/);
  const version = versionMatch ? parseInt(versionMatch[1], 10) : null;

  if (version) {
    features.push(`HLS Version ${version}`);
  }

  // Check for independent segments
  const hasIndependentSegments = content.includes('#EXT-X-INDEPENDENT-SEGMENTS');
  if (hasIndependentSegments) {
    features.push('Independent Segments');
  }

  // Check for I-frames only
  const hasIFramesOnly = content.includes('#EXT-X-I-FRAMES-ONLY');
  if (hasIFramesOnly) {
    features.push('I-Frame Playlist');
  }

  // Check for byte range
  const usesByteRange = content.includes('#EXT-X-BYTERANGE');
  if (usesByteRange) {
    features.push('Byte Range Requests');
  }

  // Check for discontinuities
  const hasDiscontinuities = content.includes('#EXT-X-DISCONTINUITY');
  if (hasDiscontinuities) {
    features.push('Discontinuity Markers');
  }

  // Check for variable GOP (via program date time)
  const hasVariableGOP = content.includes('#EXT-X-PROGRAM-DATE-TIME');
  if (hasVariableGOP) {
    features.push('Program Date-Time (Variable GOP)');
  }

  // Low latency support (version 9+, partial segments)
  const supportsLowLatency =
    (version !== null && version >= 9) ||
    content.includes('#EXT-X-PART') ||
    content.includes('#EXT-X-PRELOAD-HINT');

  if (supportsLowLatency) {
    features.push('Low Latency HLS');
  }

  // Check for server control
  if (content.includes('#EXT-X-SERVER-CONTROL')) {
    features.push('Server Control');
  }

  // Check for content steering
  if (content.includes('#EXT-X-CONTENT-STEERING')) {
    features.push('Content Steering');
  }

  // Check for session data
  if (content.includes('#EXT-X-SESSION-DATA')) {
    features.push('Session Data');
  }

  return {
    version,
    hasIndependentSegments,
    hasIFramesOnly,
    usesByteRange,
    hasDiscontinuities,
    hasVariableGOP,
    supportsLowLatency,
    features
  };
}

/**
 * Analyze DASH protocol features
 */
export function analyzeDASHProtocol(content: string): DASHProtocolAnalysis {
  const features: string[] = [];
  const profiles: string[] = [];

  // Extract profiles
  const profileMatch = content.match(/profiles="([^"]+)"/);
  if (profileMatch) {
    const profileStr = profileMatch[1];

    if (profileStr.includes('isoff-live')) {
      profiles.push('isoff-live');
      features.push('Live Profile');
    }
    if (profileStr.includes('isoff-on-demand')) {
      profiles.push('isoff-on-demand');
      features.push('On-Demand Profile');
    }
    if (profileStr.includes('isoff-main')) {
      profiles.push('isoff-main');
      features.push('Main Profile');
    }
  }

  // Check segment addressing
  const usesSegmentTemplate = content.includes('<SegmentTemplate');
  if (usesSegmentTemplate) {
    features.push('Segment Template');
  }

  const usesSegmentList = content.includes('<SegmentList');
  if (usesSegmentList) {
    features.push('Segment List');
  }

  const usesSegmentBase = content.includes('<SegmentBase');
  if (usesSegmentBase) {
    features.push('Segment Base');
  }

  // Check for BaseURL
  const hasBaseURL = content.includes('<BaseURL');
  if (hasBaseURL) {
    features.push('Base URL');
  }

  // Check for dynamic manifests
  const supportsDynamicManifests =
    content.includes('type="dynamic"') ||
    content.includes('minimumUpdatePeriod');

  if (supportsDynamicManifests) {
    features.push('Dynamic Manifest');
  }

  // Check for UTCTiming
  if (content.includes('<UTCTiming')) {
    features.push('UTC Timing');
  }

  // Check for multi-period
  const periodCount = (content.match(/<Period/g) || []).length;
  if (periodCount > 1) {
    features.push(`Multi-Period (${periodCount} periods)`);
  }

  // Check for event stream (ad insertion, etc.)
  if (content.includes('<EventStream')) {
    features.push('Event Stream (SCTE-35)');
  }

  return {
    profiles,
    usesSegmentTemplate,
    usesSegmentList,
    usesSegmentBase,
    hasBaseURL,
    supportsDynamicManifests,
    features
  };
}

/**
 * Get protocol capabilities
 */
export function getProtocolCapabilities(
  protocol: StreamingProtocol,
  version?: number
): ProtocolCapabilities {
  if (protocol === 'HLS') {
    const hlsVersion = version || 3;

    return {
      supportsLiveStreaming: true,
      supportsVOD: true,
      supportsLowLatency: hlsVersion >= 7, // LL-HLS features in v7+
      supportsDynamicManifests: true,
      supportsVariableGOP: hlsVersion >= 6,
      supportsByteRangeRequests: hlsVersion >= 4,
      supportsIFrameTrickPlay: hlsVersion >= 4,
      maxSupportedBitrate: 'Unlimited',
      multiCodecSupport: true
    };
  }

  if (protocol === 'DASH') {
    return {
      supportsLiveStreaming: true,
      supportsVOD: true,
      supportsLowLatency: true, // Via low latency extensions
      supportsDynamicManifests: true,
      supportsVariableGOP: true,
      supportsByteRangeRequests: true,
      supportsIFrameTrickPlay: true,
      maxSupportedBitrate: 'Unlimited',
      multiCodecSupport: true
    };
  }

  // Unknown protocol
  return {
    supportsLiveStreaming: false,
    supportsVOD: false,
    supportsLowLatency: false,
    supportsDynamicManifests: false,
    supportsVariableGOP: false,
    supportsByteRangeRequests: false,
    supportsIFrameTrickPlay: false,
    maxSupportedBitrate: 'Unknown',
    multiCodecSupport: false
  };
}
