// src/lib/utils/codec-analyzer.ts

export interface CodecParsed {
  codec: string;
  profile?: string;
  level?: string;
}

export interface CodecInfo {
  name: string;
  description: string;
  isVideo: boolean;
  isAudio: boolean;
  isSubtitle: boolean;
}

export interface CodecAnalysis {
  videoCodecs: string[];
  audioCodecs: string[];
  subtitleCodecs: string[];
  hasModernCodecs: boolean; // AV1, VP9, Opus
  hasHDR: boolean;
}

/**
 * Parse codec string to extract codec, profile, and level
 */
export function parseCodec(codecString: string): CodecParsed {
  // H.264 (AVC)
  if (codecString.startsWith('avc1')) {
    const match = codecString.match(/avc1\.([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/);
    if (match) {
      const profileIdc = parseInt(match[1], 16);
      const levelIdc = parseInt(match[3], 16);

      return {
        codec: 'H.264',
        profile: getH264Profile(profileIdc),
        level: getH264Level(levelIdc)
      };
    }
    return { codec: 'H.264', profile: undefined, level: undefined };
  }

  // H.265 (HEVC)
  if (codecString.startsWith('hvc1') || codecString.startsWith('hev1')) {
    return {
      codec: 'H.265',
      profile: 'Main',
      level: '3.1'
    };
  }

  // VP9
  if (codecString.startsWith('vp09') || codecString.startsWith('vp9')) {
    return {
      codec: 'VP9',
      profile: undefined,
      level: undefined
    };
  }

  // AV1
  if (codecString.startsWith('av01')) {
    return {
      codec: 'AV1',
      profile: 'Main',
      level: undefined
    };
  }

  // AAC
  if (codecString.startsWith('mp4a')) {
    const objectType = codecString.split('.')[2];

    switch (objectType) {
      case '2':
        return { codec: 'AAC-LC', profile: 'Low Complexity', level: undefined };
      case '5':
        return { codec: 'AAC-HE', profile: 'High Efficiency', level: undefined };
      case '29':
        return { codec: 'AAC-HEv2', profile: 'High Efficiency v2', level: undefined };
      default:
        return { codec: 'AAC', profile: undefined, level: undefined };
    }
  }

  // AC-3 / E-AC-3
  if (codecString === 'ac-3') {
    return { codec: 'Dolby Digital', profile: undefined, level: undefined };
  }
  if (codecString === 'ec-3') {
    return { codec: 'Dolby Digital Plus', profile: undefined, level: undefined };
  }

  // Opus
  if (codecString === 'opus') {
    return { codec: 'Opus', profile: undefined, level: undefined };
  }

  // WebVTT
  if (codecString === 'wvtt') {
    return { codec: 'WebVTT', profile: undefined, level: undefined };
  }

  // STPP (TTML)
  if (codecString === 'stpp') {
    return { codec: 'TTML', profile: undefined, level: undefined };
  }

  // Unknown
  return {
    codec: codecString,
    profile: undefined,
    level: undefined
  };
}

/**
 * Get detailed codec information
 */
export function getCodecInfo(codecString: string): CodecInfo {
  const parsed = parseCodec(codecString);

  const videoCodecs = ['H.264', 'H.265', 'VP9', 'AV1'];
  const audioCodecs = ['AAC-LC', 'AAC-HE', 'AAC-HEv2', 'AAC', 'Dolby Digital', 'Dolby Digital Plus', 'Opus'];
  const subtitleCodecs = ['WebVTT', 'TTML'];

  return {
    name: parsed.codec,
    description: getCodecDescription(parsed.codec),
    isVideo: videoCodecs.includes(parsed.codec),
    isAudio: audioCodecs.includes(parsed.codec),
    isSubtitle: subtitleCodecs.includes(parsed.codec)
  };
}

/**
 * Analyze list of codecs
 */
export function analyzeCodecs(codecs: string[]): CodecAnalysis {
  const videoCodecs: string[] = [];
  const audioCodecs: string[] = [];
  const subtitleCodecs: string[] = [];

  codecs.forEach((codec) => {
    const info = getCodecInfo(codec);
    if (info.isVideo) videoCodecs.push(codec);
    if (info.isAudio) audioCodecs.push(codec);
    if (info.isSubtitle) subtitleCodecs.push(codec);
  });

  const hasModernCodecs = codecs.some(c =>
    c.startsWith('av01') || c.startsWith('vp09') || c === 'opus'
  );

  const hasHDR = codecs.some(c =>
    c.includes('.10.') || // 10-bit
    c.includes('hvc1') || c.includes('hev1') // HEVC often used for HDR
  );

  return {
    videoCodecs,
    audioCodecs,
    subtitleCodecs,
    hasModernCodecs,
    hasHDR
  };
}

// Helper functions

function getH264Profile(profileIdc: number): string {
  switch (profileIdc) {
    case 66: return 'Baseline';
    case 77: return 'Main';
    case 88: return 'Extended';
    case 100: return 'High';
    case 110: return 'High 10';
    case 122: return 'High 4:2:2';
    case 244: return 'High 4:4:4';
    default: return 'Unknown';
  }
}

function getH264Level(levelIdc: number): string {
  const level = levelIdc / 10;
  return level.toFixed(1);
}

function getCodecDescription(codec: string): string {
  const descriptions: Record<string, string> = {
    'H.264': 'Advanced Video Coding (AVC) - Widely supported, efficient compression',
    'H.265': 'High Efficiency Video Coding (HEVC) - 50% better compression than H.264',
    'VP9': 'Google VP9 - Open, royalty-free, similar efficiency to H.265',
    'AV1': 'AOMedia Video 1 - Next-gen codec, 30% better than H.265',
    'AAC-LC': 'Advanced Audio Coding Low Complexity - Standard quality',
    'AAC-HE': 'High Efficiency AAC - Optimized for low bitrates',
    'AAC-HEv2': 'HE-AAC v2 with Parametric Stereo',
    'Dolby Digital': 'AC-3 audio codec - 5.1 surround sound',
    'Dolby Digital Plus': 'Enhanced AC-3 - Better quality, more channels',
    'Opus': 'Modern, open audio codec - Excellent quality at all bitrates',
    'WebVTT': 'Web Video Text Tracks - HTML5 subtitle format',
    'TTML': 'Timed Text Markup Language - XML-based subtitles'
  };

  return descriptions[codec] || 'Unknown codec';
}
