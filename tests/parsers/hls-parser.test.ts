// tests/parsers/hls-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseHLS } from '../../src/lib/parsers/hls-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const bipbopMaster = readFileSync(
  resolve(__dirname, '../fixtures/bipbop-master.m3u8'),
  'utf-8'
);

describe('parseHLS', () => {
  it('should parse master playlist and extract variants', () => {
    const result = parseHLS(bipbopMaster, 'https://example.com/master.m3u8');

    expect(result.format).toBe('hls');
    expect(result.variants).toHaveLength(3);
    expect(result.variants[0].bitrate).toBe(2227464);
    expect(result.variants[0].resolution).toEqual({ width: 960, height: 540 });
  });

  it('should resolve relative variant URLs', () => {
    const result = parseHLS(bipbopMaster, 'https://example.com/path/master.m3u8');

    expect(result.variants[0].url).toBe('https://example.com/path/gear4/prog_index.m3u8');
  });

  it('should extract codec information', () => {
    const result = parseHLS(bipbopMaster, 'https://example.com/master.m3u8');

    expect(result.variants[0].codecs).toContain('avc1.640020');
    expect(result.variants[0].codecs).toContain('mp4a.40.2');
  });
});
