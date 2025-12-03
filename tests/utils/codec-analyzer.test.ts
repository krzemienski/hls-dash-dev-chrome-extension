// tests/utils/codec-analyzer.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseCodec,
  getCodecInfo,
  analyzeCodecs
} from '../../src/lib/utils/codec-analyzer';

describe('parseCodec', () => {
  it('should parse H.264 codec strings', () => {
    expect(parseCodec('avc1.64001f')).toEqual({
      codec: 'H.264',
      profile: 'High',
      level: '3.1'
    });

    expect(parseCodec('avc1.640020')).toEqual({
      codec: 'H.264',
      profile: 'High',
      level: '3.2'
    });
  });

  it('should parse H.265 codec strings', () => {
    expect(parseCodec('hvc1.1.6.L93.B0')).toEqual({
      codec: 'H.265',
      profile: 'Main',
      level: '3.1'
    });
  });

  it('should parse AAC codec strings', () => {
    expect(parseCodec('mp4a.40.2')).toEqual({
      codec: 'AAC-LC',
      profile: 'Low Complexity',
      level: undefined
    });

    expect(parseCodec('mp4a.40.5')).toEqual({
      codec: 'AAC-HE',
      profile: 'High Efficiency',
      level: undefined
    });
  });

  it('should handle unknown codecs', () => {
    expect(parseCodec('unknown.codec')).toEqual({
      codec: 'unknown.codec',
      profile: undefined,
      level: undefined
    });
  });
});

describe('getCodecInfo', () => {
  it('should provide detailed codec information', () => {
    const info = getCodecInfo('avc1.64001f');

    expect(info.name).toBe('H.264');
    expect(info.description).toContain('Advanced Video Coding');
    expect(info.isVideo).toBe(true);
    expect(info.isAudio).toBe(false);
  });

  it('should identify audio codecs', () => {
    const info = getCodecInfo('mp4a.40.2');

    expect(info.isVideo).toBe(false);
    expect(info.isAudio).toBe(true);
  });
});

describe('analyzeCodecs', () => {
  it('should analyze codec list and provide summary', () => {
    const codecs = ['avc1.64001f', 'mp4a.40.2', 'wvtt'];

    const analysis = analyzeCodecs(codecs);

    expect(analysis.videoCodecs.length).toBe(1);
    expect(analysis.audioCodecs.length).toBe(1);
    expect(analysis.subtitleCodecs.length).toBe(1);
    expect(analysis.hasModernCodecs).toBe(false); // avc1 is not modern (AV1/VP9)
  });

  it('should detect modern codecs', () => {
    const codecs = ['av01.0.05M.08', 'opus'];

    const analysis = analyzeCodecs(codecs);

    expect(analysis.hasModernCodecs).toBe(true);
  });
});
