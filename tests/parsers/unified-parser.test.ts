// tests/parsers/unified-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseManifest } from '../../src/lib/parsers/index';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const bipbopMaster = readFileSync(
  resolve(__dirname, '../fixtures/bipbop-master.m3u8'),
  'utf-8'
);

const sampleMpd = readFileSync(
  resolve(__dirname, '../fixtures/sample-dash.mpd'),
  'utf-8'
);

describe('parseManifest', () => {
  it('should auto-detect and parse HLS manifests', () => {
    const result = parseManifest(bipbopMaster, 'https://example.com/master.m3u8');

    expect(result.format).toBe('hls');
    expect(result.variants).toHaveLength(3);
  });

  it('should auto-detect and parse DASH manifests', () => {
    const result = parseManifest(sampleMpd, 'https://example.com/manifest.mpd');

    expect(result.format).toBe('dash');
    expect(result.variants.length).toBeGreaterThan(0);
  });

  it('should throw error for invalid content', () => {
    expect(() => parseManifest('', 'https://example.com/empty.m3u8'))
      .toThrow();
  });
});
