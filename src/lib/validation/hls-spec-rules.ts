// HLS Specification Validation Rules - RFC 8216
// Each function validates one specific rule and returns ValidationIssue or null

import type { ValidationIssue } from '../../types/validation';

/**
 * Rule 1: EXTM3U must be first line
 * Spec: RFC 8216 § 4.3.1.1
 */
export function validateEXTM3UFirstLine(content: string): ValidationIssue | null {
  const lines = content.trim().split('\n');
  const firstLine = lines[0]?.trim();

  if (firstLine !== '#EXTM3U') {
    return {
      code: 'EXTM3U_FIRST_LINE',
      severity: 'error',
      line: 1,
      tag: 'EXTM3U',
      message: 'First line must be #EXTM3U',
      specReference: 'RFC 8216 § 4.3.1.1',
      specUrl: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.1.1',
      suggestion: 'Add #EXTM3U as the first line of the playlist'
    };
  }

  return null;
}

/**
 * Rule 2: No BOM (Byte Order Mark) allowed
 * Spec: RFC 8216 § 4.1
 */
export function validateUTF8NoBOM(content: string): ValidationIssue | null {
  if (content.charCodeAt(0) === 0xFEFF) {
    return {
      code: 'UTF8_NO_BOM',
      severity: 'error',
      line: 1,
      message: 'Playlist contains Byte Order Mark (BOM) which must be removed',
      specReference: 'RFC 8216 § 4.1',
      suggestion: 'Save file as UTF-8 without BOM'
    };
  }

  return null;
}

/**
 * Rule 3: Cannot mix Master and Media playlist tags
 * Spec: RFC 8216 § 4.1
 */
export function validateNoMixedPlaylistTypes(content: string): ValidationIssue | null {
  const hasMasterTag = content.includes('#EXT-X-STREAM-INF');
  const hasMediaTag = content.includes('#EXTINF');

  if (hasMasterTag && hasMediaTag) {
    return {
      code: 'MIXED_PLAYLIST_TYPES',
      severity: 'error',
      message: 'Playlist contains both Master Playlist tags (EXT-X-STREAM-INF) and Media Playlist tags (EXTINF)',
      specReference: 'RFC 8216 § 4.1',
      suggestion: 'A playlist must be either a Master Playlist or a Media Playlist, not both'
    };
  }

  return null;
}

/**
 * Rule 4: Media playlists must have EXT-X-TARGETDURATION
 * Spec: RFC 8216 § 4.3.3.1
 */
export function validateMediaTargetDuration(content: string, playlistType: 'master' | 'media'): ValidationIssue | null {
  if (playlistType !== 'media') return null;

  if (!content.includes('#EXT-X-TARGETDURATION')) {
    return {
      code: 'MEDIA_TARGETDURATION_REQUIRED',
      severity: 'error',
      tag: 'EXT-X-TARGETDURATION',
      message: 'Media Playlist must have #EXT-X-TARGETDURATION tag',
      specReference: 'RFC 8216 § 4.3.3.1',
      suggestion: 'Add #EXT-X-TARGETDURATION:<seconds> (e.g., #EXT-X-TARGETDURATION:10)'
    };
  }

  return null;
}

/**
 * Rule 5: EXTINF must precede each segment URI
 * Spec: RFC 8216 § 4.3.2.1
 */
export function validateEXTINFBeforeSegments(content: string, playlistType: 'master' | 'media'): ValidationIssue[] {
  if (playlistType !== 'media') return [];

  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');
  let lastEXTINFLine = -1;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      if (trimmed.startsWith('#EXTINF')) {
        lastEXTINFLine = index;
      }
      return;
    }

    // This is a URI line (segment)
    if (lastEXTINFLine !== index - 1) {
      issues.push({
        code: 'EXTINF_BEFORE_SEGMENT',
        severity: 'error',
        line: index + 1,
        tag: 'EXTINF',
        message: 'Media segment must be preceded by #EXTINF tag',
        specReference: 'RFC 8216 § 4.3.2.1',
        suggestion: 'Add #EXTINF:<duration>,<title> on the line before this segment URL'
      });
    }
  });

  return issues;
}

/**
 * Rule 6: EXT-X-STREAM-INF must have BANDWIDTH
 * Spec: RFC 8216 § 4.3.4.2
 */
export function validateStreamInfBandwidth(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      if (!line.includes('BANDWIDTH=')) {
        issues.push({
          code: 'STREAM_INF_BANDWIDTH_REQUIRED',
          severity: 'error',
          line: index + 1,
          tag: 'EXT-X-STREAM-INF',
          attribute: 'BANDWIDTH',
          message: '#EXT-X-STREAM-INF must include BANDWIDTH attribute',
          specReference: 'RFC 8216 § 4.3.4.2',
          specUrl: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.2',
          suggestion: 'Add BANDWIDTH=<bitrate> (e.g., BANDWIDTH=2000000)'
        });
      }
    }
  });

  return issues;
}

/**
 * Rule 7: CODECS attribute recommended in EXT-X-STREAM-INF
 * Spec: RFC 8216 § 4.3.4.2
 */
export function validateStreamInfCodecs(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      if (!line.includes('CODECS=')) {
        issues.push({
          code: 'STREAM_INF_CODECS_RECOMMENDED',
          severity: 'warning',
          line: index + 1,
          tag: 'EXT-X-STREAM-INF',
          attribute: 'CODECS',
          message: '#EXT-X-STREAM-INF should include CODECS attribute for better compatibility',
          specReference: 'RFC 8216 § 4.3.4.2',
          suggestion: 'Add CODECS="avc1.4d401e,mp4a.40.2" or appropriate codec strings'
        });
      }
    }
  });

  return issues;
}

/**
 * Rule 8: Version compatibility check
 * Spec: RFC 8216 § 7
 */
export function validateVersionCompatibility(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Extract declared version (default to 1)
  const versionMatch = content.match(/#EXT-X-VERSION:(\d+)/);
  const declaredVersion = versionMatch ? parseInt(versionMatch[1]) : 1;

  // Check for features requiring specific versions
  const featureChecks: { pattern: RegExp; tag: string; minVersion: number; lineMatch?: string }[] = [
    { pattern: /#EXTINF:\d+\.\d+/, tag: 'EXTINF (floating-point)', minVersion: 3 },
    { pattern: /#EXT-X-BYTERANGE/, tag: 'EXT-X-BYTERANGE', minVersion: 4 },
    { pattern: /#EXT-X-I-FRAMES-ONLY/, tag: 'EXT-X-I-FRAMES-ONLY', minVersion: 4 },
    { pattern: /#EXT-X-MAP/, tag: 'EXT-X-MAP', minVersion: 5 },
    { pattern: /#EXT-X-INDEPENDENT-SEGMENTS/, tag: 'EXT-X-INDEPENDENT-SEGMENTS', minVersion: 6 },
    { pattern: /#EXT-X-START/, tag: 'EXT-X-START', minVersion: 6 },
  ];

  featureChecks.forEach(({ pattern, tag, minVersion }) => {
    if (pattern.test(content) && declaredVersion < minVersion) {
      const match = content.match(pattern);
      let lineNumber = 1;
      if (match?.index !== undefined) {
        lineNumber = content.substring(0, match.index).split('\n').length;
      }

      issues.push({
        code: 'VERSION_FEATURE_MISMATCH',
        severity: 'error',
        line: lineNumber,
        tag,
        message: `${tag} requires HLS version ${minVersion}+, but version ${declaredVersion} is declared`,
        specReference: 'RFC 8216 § 7',
        suggestion: `Change #EXT-X-VERSION to ${minVersion} or higher`
      });
    }
  });

  // Check for IV attribute requiring version 2+
  if (content.includes('IV=') && declaredVersion < 2) {
    const ivMatch = content.match(/IV=/);
    const lineNumber = ivMatch ? content.substring(0, ivMatch.index).split('\n').length : 1;

    issues.push({
      code: 'IV_REQUIRES_VERSION_2',
      severity: 'error',
      line: lineNumber,
      attribute: 'IV',
      message: 'IV attribute in EXT-X-KEY requires HLS version 2+',
      specReference: 'RFC 8216 § 4.3.2.4',
      suggestion: 'Add #EXT-X-VERSION:2 or higher'
    });
  }

  return issues;
}

/**
 * Rule 9: Validate codec string formats
 * Spec: RFC 6381 (referenced by RFC 8216)
 */
export function validateCodecStrings(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const codecPattern = /CODECS="([^"]+)"/g;
  let match;

  while ((match = codecPattern.exec(content)) !== null) {
    const codecs = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;

    const codecList = codecs.split(',').map(c => c.trim());

    codecList.forEach(codec => {
      const issue = validateSingleCodec(codec, lineNumber);
      if (issue) {
        issues.push(issue);
      }
    });
  }

  return issues;
}

function validateSingleCodec(codec: string, lineNumber: number): ValidationIssue | null {
  // H.264/AVC validation
  if (codec.startsWith('avc1.')) {
    const suffix = codec.substring(5);
    if (!/^[0-9A-Fa-f]{6}$/.test(suffix)) {
      return {
        code: 'INVALID_H264_CODEC',
        severity: 'error',
        line: lineNumber,
        attribute: 'CODECS',
        message: `Invalid H.264 codec string: "${codec}". Expected format: avc1.[6 hex digits]`,
        specReference: 'RFC 6381 § 3.3',
        suggestion: 'Use format like avc1.4d401e (Main Profile Level 3.0)'
      };
    }
  }

  // AAC validation
  if (codec.startsWith('mp4a.40.')) {
    const objectType = codec.substring(8);
    if (!/^\d{1,2}$/.test(objectType)) {
      return {
        code: 'INVALID_AAC_CODEC',
        severity: 'error',
        line: lineNumber,
        attribute: 'CODECS',
        message: `Invalid AAC codec string: "${codec}". Expected format: mp4a.40.[1-2 digits]`,
        specReference: 'RFC 6381 § 3.3',
        suggestion: 'Use format like mp4a.40.2 (AAC-LC)'
      };
    }
  }

  // HEVC/H.265 validation
  if (codec.startsWith('hvc1.') || codec.startsWith('hev1.')) {
    // HEVC format is more complex, basic check for now
    if (codec.length < 10) {
      return {
        code: 'INVALID_HEVC_CODEC',
        severity: 'warning',
        line: lineNumber,
        attribute: 'CODECS',
        message: `H.265 codec string may be invalid: "${codec}"`,
        specReference: 'RFC 6381 § 3.4'
      };
    }
  }

  return null;
}

/**
 * Rule 10: Detect playlist type
 */
export function detectPlaylistType(content: string): 'master' | 'media' {
  const hasMasterTag = content.includes('#EXT-X-STREAM-INF');
  const hasMediaTag = content.includes('#EXTINF');

  // If has STREAM-INF, it's a master playlist
  if (hasMasterTag) return 'master';

  // If has EXTINF, it's a media playlist
  if (hasMediaTag) return 'media';

  // Default to master if ambiguous
  return 'master';
}

/**
 * Rule 11: Detect HLS version
 */
export function detectHLSVersion(content: string): number {
  const versionMatch = content.match(/#EXT-X-VERSION:(\d+)/);
  return versionMatch ? parseInt(versionMatch[1]) : 1;
}

/**
 * Rule 12: EXTINF duration must be positive
 * Spec: RFC 8216 § 4.3.2.1
 */
export function validateEXTINFDuration(content: string, playlistType: 'master' | 'media'): ValidationIssue[] {
  if (playlistType !== 'media') return [];

  const issues: ValidationIssue[] = [];
  const extinfPattern = /#EXTINF:([\d.]+)/g;
  let match;

  while ((match = extinfPattern.exec(content)) !== null) {
    const duration = parseFloat(match[1]);
    const lineNumber = content.substring(0, match.index).split('\n').length;

    if (duration <= 0) {
      issues.push({
        code: 'EXTINF_DURATION_POSITIVE',
        severity: 'error',
        line: lineNumber,
        tag: 'EXTINF',
        message: `EXTINF duration must be greater than 0, found: ${duration}`,
        specReference: 'RFC 8216 § 4.3.2.1',
        suggestion: 'Use a positive duration value'
      });
    }
  }

  return issues;
}

/**
 * Rule 13: BANDWIDTH must be positive
 * Spec: RFC 8216 § 4.3.4.2
 */
export function validateBandwidthPositive(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const bandwidthPattern = /BANDWIDTH=(\d+)/g;
  let match;

  while ((match = bandwidthPattern.exec(content)) !== null) {
    const bandwidth = parseInt(match[1]);
    const lineNumber = content.substring(0, match.index).split('\n').length;

    if (bandwidth <= 0) {
      issues.push({
        code: 'BANDWIDTH_POSITIVE',
        severity: 'error',
        line: lineNumber,
        attribute: 'BANDWIDTH',
        message: `BANDWIDTH must be greater than 0, found: ${bandwidth}`,
        specReference: 'RFC 8216 § 4.3.4.2',
        suggestion: 'Use a positive bandwidth value in bits per second'
      });
    }
  }

  return issues;
}

/**
 * Rule 14: EXT-X-KEY METHOD validation
 * Spec: RFC 8216 § 4.3.2.4
 */
export function validateKeyMethod(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const keyPattern = /#EXT-X-KEY:(.+)/g;
  let match;

  while ((match = keyPattern.exec(content)) !== null) {
    const keyTag = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;

    // METHOD is required
    const methodMatch = keyTag.match(/METHOD=([A-Z0-9-]+)/);
    if (!methodMatch) {
      issues.push({
        code: 'KEY_METHOD_REQUIRED',
        severity: 'error',
        line: lineNumber,
        tag: 'EXT-X-KEY',
        attribute: 'METHOD',
        message: 'EXT-X-KEY must have METHOD attribute',
        specReference: 'RFC 8216 § 4.3.2.4',
        suggestion: 'Add METHOD=AES-128 or METHOD=NONE'
      });
      continue;
    }

    const method = methodMatch[1];
    const validMethods = ['NONE', 'AES-128', 'SAMPLE-AES'];

    if (!validMethods.includes(method)) {
      issues.push({
        code: 'KEY_METHOD_INVALID',
        severity: 'error',
        line: lineNumber,
        tag: 'EXT-X-KEY',
        attribute: 'METHOD',
        message: `Invalid METHOD="${method}". Must be NONE, AES-128, or SAMPLE-AES`,
        specReference: 'RFC 8216 § 4.3.2.4',
        suggestion: 'Use METHOD=AES-128 for encryption or METHOD=NONE for no encryption'
      });
    }

    // If METHOD is not NONE, URI is required
    if (method !== 'NONE' && !keyTag.includes('URI=')) {
      issues.push({
        code: 'KEY_URI_REQUIRED',
        severity: 'error',
        line: lineNumber,
        tag: 'EXT-X-KEY',
        attribute: 'URI',
        message: 'EXT-X-KEY with METHOD other than NONE must have URI attribute',
        specReference: 'RFC 8216 § 4.3.2.4',
        suggestion: 'Add URI="https://example.com/key"'
      });
    }
  }

  return issues;
}

/**
 * Detect HLS features present in manifest
 */
export function detectHLSFeatures(content: string, _version: number): Array<{ name: string; version: number; detected: boolean; tag?: string }> {
  const features: Array<{ name: string; version: number; detected: boolean; tag?: string }> = [];

  const featurePatterns = [
    { name: 'Independent Segments', pattern: /#EXT-X-INDEPENDENT-SEGMENTS/, version: 6, tag: 'EXT-X-INDEPENDENT-SEGMENTS' },
    { name: 'Byte Range Support', pattern: /#EXT-X-BYTERANGE/, version: 4, tag: 'EXT-X-BYTERANGE' },
    { name: 'I-Frame Playlists', pattern: /#EXT-X-I-FRAMES-ONLY/, version: 4, tag: 'EXT-X-I-FRAMES-ONLY' },
    { name: 'Initialization Segments (fMP4)', pattern: /#EXT-X-MAP/, version: 5, tag: 'EXT-X-MAP' },
    { name: 'AES-128 Encryption', pattern: /#EXT-X-KEY:.*METHOD=AES-128/, version: 1, tag: 'EXT-X-KEY' },
    { name: 'SAMPLE-AES Encryption', pattern: /#EXT-X-KEY:.*METHOD=SAMPLE-AES/, version: 5, tag: 'EXT-X-KEY' },
    { name: 'Program Date-Time', pattern: /#EXT-X-PROGRAM-DATE-TIME/, version: 1, tag: 'EXT-X-PROGRAM-DATE-TIME' },
    { name: 'Discontinuity', pattern: /#EXT-X-DISCONTINUITY/, version: 1, tag: 'EXT-X-DISCONTINUITY' },
  ];

  featurePatterns.forEach(({ name, pattern, version: minVersion, tag }) => {
    features.push({
      name,
      version: minVersion,
      detected: pattern.test(content),
      tag
    });
  });

  return features;
}

/**
 * Get all HLS rule names
 */
export function getAllHLSRuleNames(): string[] {
  return [
    'EXTM3U_FIRST_LINE',
    'UTF8_NO_BOM',
    'MIXED_PLAYLIST_TYPES',
    'MEDIA_TARGETDURATION_REQUIRED',
    'EXTINF_BEFORE_SEGMENT',
    'STREAM_INF_BANDWIDTH_REQUIRED',
    'STREAM_INF_CODECS_RECOMMENDED',
    'VERSION_FEATURE_MISMATCH',
    'INVALID_H264_CODEC',
    'INVALID_AAC_CODEC',
    'INVALID_HEVC_CODEC',
    'EXTINF_DURATION_POSITIVE',
    'BANDWIDTH_POSITIVE',
    'KEY_METHOD_REQUIRED',
    'KEY_METHOD_INVALID',
    'KEY_URI_REQUIRED',
    'IV_REQUIRES_VERSION_2',
  ];
}
