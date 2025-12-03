// src/lib/utils/url-resolver.ts

/**
 * Detect if URL is relative (path-relative or domain-relative)
 *
 * Returns true for:
 *   - "playlist.m3u8" (path-relative)
 *   - "/path/playlist.m3u8" (domain-relative)
 *
 * Returns false for:
 *   - "https://example.com/playlist.m3u8" (absolute)
 *   - "//cdn.example.com/playlist.m3u8" (protocol-relative)
 *
 * Adapted from: abr-manifest-viewer-chrome/viewer/js/main.js:88-91
 */
export function isRelativeUrl(url: string): boolean {
  // Test for protocol (http://, https://) or protocol-relative (//)
  return !/^(?:[a-z]+:)?\/\//i.test(url);
}
