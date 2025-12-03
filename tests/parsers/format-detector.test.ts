// tests/parsers/format-detector.test.ts
import { describe, it, expect } from 'vitest';
import { detectManifestFormat } from '../../src/lib/parsers/format-detector';

describe('detectManifestFormat', () => {
  it('should detect HLS from #EXTM3U header', () => {
    const m3u8 = '#EXTM3U\n#EXT-X-VERSION:3\n';
    expect(detectManifestFormat(m3u8)).toBe('hls');
  });

  it('should detect DASH from XML declaration', () => {
    const mpd = '<?xml version="1.0"?>\n<MPD>';
    expect(detectManifestFormat(mpd)).toBe('dash');
  });

  it('should detect DASH from MPD element', () => {
    const mpd = '<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">';
    expect(detectManifestFormat(mpd)).toBe('dash');
  });

  it('should handle whitespace before content', () => {
    const m3u8WithSpaces = '  \n\n#EXTM3U\n';
    expect(detectManifestFormat(m3u8WithSpaces)).toBe('hls');
  });

  it('should default to HLS for ambiguous content', () => {
    const ambiguous = 'some random text';
    expect(detectManifestFormat(ambiguous)).toBe('hls');
  });
});
