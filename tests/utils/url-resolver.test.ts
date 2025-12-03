// tests/utils/url-resolver.test.ts
import { describe, it, expect } from 'vitest';
import { isRelativeUrl, resolveManifestUrl } from '../../src/lib/utils/url-resolver';

describe('isRelativeUrl', () => {
  it('should return true for relative paths', () => {
    expect(isRelativeUrl('playlist.m3u8')).toBe(true);
    expect(isRelativeUrl('path/to/playlist.m3u8')).toBe(true);
  });

  it('should return true for domain-relative paths', () => {
    expect(isRelativeUrl('/path/playlist.m3u8')).toBe(true);
  });

  it('should return false for absolute URLs', () => {
    expect(isRelativeUrl('https://example.com/playlist.m3u8')).toBe(false);
    expect(isRelativeUrl('http://example.com/playlist.m3u8')).toBe(false);
  });

  it('should return false for protocol-relative URLs', () => {
    expect(isRelativeUrl('//cdn.example.com/playlist.m3u8')).toBe(false);
  });
});

describe('resolveManifestUrl', () => {
  const baseUrl = 'https://example.com/path/to/master.m3u8';

  it('should return absolute URLs unchanged', () => {
    expect(resolveManifestUrl('https://other.com/stream.m3u8', baseUrl))
      .toBe('https://other.com/stream.m3u8');
  });

  it('should resolve path-relative URLs', () => {
    expect(resolveManifestUrl('variant.m3u8', baseUrl))
      .toBe('https://example.com/path/to/variant.m3u8');
  });

  it('should resolve domain-relative URLs', () => {
    expect(resolveManifestUrl('/other/path/variant.m3u8', baseUrl))
      .toBe('https://example.com/other/path/variant.m3u8');
  });

  it('should handle query parameters in base URL', () => {
    const baseWithQuery = 'https://example.com/master.m3u8?token=abc';
    expect(resolveManifestUrl('variant.m3u8', baseWithQuery))
      .toBe('https://example.com/variant.m3u8');
  });

  it('should handle trailing slashes correctly', () => {
    const baseWithSlash = 'https://example.com/path/';
    expect(resolveManifestUrl('variant.m3u8', baseWithSlash))
      .toBe('https://example.com/path/variant.m3u8');
  });
});
