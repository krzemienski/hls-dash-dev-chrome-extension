// tests/utils/streaming-protocol.test.ts
import { describe, it, expect } from 'vitest';
import {
  detectStreamingProtocol,
  analyzeHLSProtocol,
  analyzeDASHProtocol,
  getProtocolCapabilities
} from '../../src/lib/utils/streaming-protocol';

describe('detectStreamingProtocol', () => {
  it('should detect HLS from manifest content', () => {
    const hlsContent = '#EXTM3U\n#EXT-X-VERSION:6\n#EXT-X-INDEPENDENT-SEGMENTS';
    const protocol = detectStreamingProtocol(hlsContent);

    expect(protocol).toBe('HLS');
  });

  it('should detect DASH from manifest content', () => {
    const dashContent = '<?xml version="1.0"?>\n<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">';
    const protocol = detectStreamingProtocol(dashContent);

    expect(protocol).toBe('DASH');
  });
});

describe('analyzeHLSProtocol', () => {
  it('should detect HLS version', () => {
    const content = '#EXTM3U\n#EXT-X-VERSION:7';
    const analysis = analyzeHLSProtocol(content);

    expect(analysis.version).toBe(7);
  });

  it('should detect independent segments', () => {
    const content = '#EXTM3U\n#EXT-X-INDEPENDENT-SEGMENTS';
    const analysis = analyzeHLSProtocol(content);

    expect(analysis.hasIndependentSegments).toBe(true);
  });

  it('should detect I-frame playlists', () => {
    const content = '#EXTM3U\n#EXT-X-I-FRAMES-ONLY';
    const analysis = analyzeHLSProtocol(content);

    expect(analysis.hasIFramesOnly).toBe(true);
  });

  it('should detect byte range support', () => {
    const content = '#EXTM3U\n#EXT-X-BYTERANGE:1234@0';
    const analysis = analyzeHLSProtocol(content);

    expect(analysis.usesByteRange).toBe(true);
  });

  it('should detect discontinuity tags', () => {
    const content = '#EXTM3U\n#EXT-X-DISCONTINUITY';
    const analysis = analyzeHLSProtocol(content);

    expect(analysis.hasDiscontinuities).toBe(true);
  });
});

describe('analyzeDASHProtocol', () => {
  it('should detect DASH profile', () => {
    const content = '<MPD profiles="urn:mpeg:dash:profile:isoff-live:2011">';
    const analysis = analyzeDASHProtocol(content);

    expect(analysis.profiles).toContain('isoff-live');
  });

  it('should detect segment templates', () => {
    const content = '<MPD><SegmentTemplate media="$Number$.m4s" /></MPD>';
    const analysis = analyzeDASHProtocol(content);

    expect(analysis.usesSegmentTemplate).toBe(true);
  });

  it('should detect segment lists', () => {
    const content = '<MPD><SegmentList></SegmentList></MPD>';
    const analysis = analyzeDASHProtocol(content);

    expect(analysis.usesSegmentList).toBe(true);
  });

  it('should detect base URLs', () => {
    const content = '<MPD><BaseURL>https://example.com/</BaseURL></MPD>';
    const analysis = analyzeDASHProtocol(content);

    expect(analysis.hasBaseURL).toBe(true);
  });
});

describe('getProtocolCapabilities', () => {
  it('should return HLS capabilities', () => {
    const caps = getProtocolCapabilities('HLS', 7);

    expect(caps.supportsLowLatency).toBe(true);
    expect(caps.supportsVariableGOP).toBe(true);
  });

  it('should return DASH capabilities', () => {
    const caps = getProtocolCapabilities('DASH', 2);

    expect(caps.supportsDynamicManifests).toBe(true);
    expect(caps.supportsLiveStreaming).toBe(true);
  });

  it('should handle different HLS versions', () => {
    const v3 = getProtocolCapabilities('HLS', 3);
    const v7 = getProtocolCapabilities('HLS', 7);

    expect(v7.supportsLowLatency).toBe(true);
    expect(v3.supportsLowLatency).toBe(false);
  });
});
