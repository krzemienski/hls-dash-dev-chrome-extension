// tests/utils/url-resolver.test.ts
import { describe, it, expect } from 'vitest';
import { isRelativeUrl } from '../../src/lib/utils/url-resolver';

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
