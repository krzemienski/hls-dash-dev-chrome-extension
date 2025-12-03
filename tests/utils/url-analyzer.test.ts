// tests/utils/url-analyzer.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseUrlParameters,
  analyzeManifestUrl,
  detectCDN
} from '../../src/lib/utils/url-analyzer';

describe('parseUrlParameters', () => {
  it('should parse query parameters from URL', () => {
    const url = 'https://example.com/manifest.m3u8?token=abc123&quality=high&format=hls';
    const params = parseUrlParameters(url);

    expect(params.get('token')).toBe('abc123');
    expect(params.get('quality')).toBe('high');
    expect(params.get('format')).toBe('hls');
  });

  it('should handle URL without parameters', () => {
    const url = 'https://example.com/manifest.m3u8';
    const params = parseUrlParameters(url);

    expect(params.size).toBe(0);
  });

  it('should handle URLs with hash', () => {
    const url = 'https://example.com/manifest.m3u8?token=abc#section';
    const params = parseUrlParameters(url);

    expect(params.get('token')).toBe('abc');
  });
});

describe('analyzeManifestUrl', () => {
  it('should detect authentication tokens', () => {
    const url = 'https://example.com/manifest.m3u8?token=abc123&key=xyz';
    const analysis = analyzeManifestUrl(url);

    expect(analysis.hasAuth).toBe(true);
    expect(analysis.authParams.length).toBeGreaterThan(0);
  });

  it('should detect timestamp parameters', () => {
    const url = 'https://example.com/manifest.m3u8?timestamp=1234567890';
    const analysis = analyzeManifestUrl(url);

    expect(analysis.hasTimestamp).toBe(true);
  });

  it('should extract domain information', () => {
    const url = 'https://cdn.example.com/path/to/manifest.m3u8';
    const analysis = analyzeManifestUrl(url);

    expect(analysis.domain).toBe('cdn.example.com');
    expect(analysis.path).toBe('/path/to/manifest.m3u8');
  });
});

describe('detectCDN', () => {
  it('should detect CloudFront CDN', () => {
    const url = 'https://d123abc.cloudfront.net/manifest.m3u8';
    const cdn = detectCDN(url);

    expect(cdn).toBe('CloudFront');
  });

  it('should detect Akamai CDN', () => {
    const url = 'https://example.akamaized.net/manifest.m3u8';
    const cdn = detectCDN(url);

    expect(cdn).toBe('Akamai');
  });

  it('should detect Fastly CDN', () => {
    const url = 'https://example.fastly.net/manifest.m3u8';
    const cdn = detectCDN(url);

    expect(cdn).toBe('Fastly');
  });

  it('should return null for unknown CDN', () => {
    const url = 'https://example.com/manifest.m3u8';
    const cdn = detectCDN(url);

    expect(cdn).toBeNull();
  });
});
