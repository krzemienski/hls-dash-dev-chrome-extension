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

/**
 * Resolve relative URL to absolute URL based on manifest base URL
 *
 * Examples:
 *   Base: https://example.com/path/to/master.m3u8
 *
 *   "variant.m3u8" → "https://example.com/path/to/variant.m3u8"
 *   "/other/variant.m3u8" → "https://example.com/other/variant.m3u8"
 *   "https://cdn.com/variant.m3u8" → "https://cdn.com/variant.m3u8"
 *
 * Adapted from: abr-manifest-viewer-chrome/viewer/js/main.js:93-108
 */
export function resolveManifestUrl(uriReference: string, baseUrl: string): string {
  // Already absolute - return as-is
  if (!isRelativeUrl(uriReference)) {
    return uriReference;
  }

  try {
    const base = new URL(baseUrl);

    if (uriReference.startsWith('/')) {
      // Domain-relative: /path/file.m3u8
      return `${base.origin}${uriReference}`;
    } else {
      // Path-relative: file.m3u8
      // Use URL constructor's built-in resolution
      return new URL(uriReference, baseUrl).toString();
    }
  } catch (error) {
    console.error('Failed to resolve URL:', uriReference, 'with base:', baseUrl, error);
    return uriReference; // Return original on error
  }
}
