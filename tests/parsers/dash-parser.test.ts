// tests/parsers/dash-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseDASH } from '../../src/lib/parsers/dash-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sampleMpd = readFileSync(
  resolve(__dirname, '../fixtures/sample-dash.mpd'),
  'utf-8'
);

describe('parseDASH', () => {
  it('should parse MPD and extract video variants', () => {
    const result = parseDASH(sampleMpd, 'https://example.com/manifest.mpd');

    expect(result.format).toBe('dash');
    expect(result.variants.length).toBeGreaterThan(0);

    const videoVariants = result.variants.filter(v => v.type === 'video');
    expect(videoVariants).toHaveLength(2);
    expect(videoVariants[0].bitrate).toBe(1000000);
    expect(videoVariants[1].bitrate).toBe(2000000);
  });

  it('should extract resolution from video variants', () => {
    const result = parseDASH(sampleMpd, 'https://example.com/manifest.mpd');

    const videoVariants = result.variants.filter(v => v.type === 'video');
    expect(videoVariants[0].resolution).toEqual({ width: 854, height: 480 });
  });

  it('should extract codec information', () => {
    const result = parseDASH(sampleMpd, 'https://example.com/manifest.mpd');

    const videoVariants = result.variants.filter(v => v.type === 'video');
    expect(videoVariants[0].codecs).toContain('avc1.4d401f');

    const audioVariants = result.variants.filter(v => v.type === 'audio');
    expect(audioVariants[0].codecs).toContain('mp4a.40.2');
  });

  it('should parse metadata correctly', () => {
    const result = parseDASH(sampleMpd, 'https://example.com/manifest.mpd');

    expect(result.metadata.type).toBe('VOD');
    expect(result.metadata.duration).toBeCloseTo(634.566, 2);
    expect(result.metadata.minBufferTime).toBe(2.0);
  });

  it('should identify audio and video variants separately', () => {
    const result = parseDASH(sampleMpd, 'https://example.com/manifest.mpd');

    const videoVariants = result.variants.filter(v => v.type === 'video');
    const audioVariants = result.variants.filter(v => v.type === 'audio');

    expect(videoVariants.length).toBe(2);
    expect(audioVariants.length).toBe(1);
  });
});
