// src/lib/utils/manifest-detector.ts
import type { ManifestFormat } from '../../types/manifest';

/**
 * Detect if URL points to a manifest file
 */
export function isManifestUrl(url: string): boolean {
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.m3u8') || cleanUrl.endsWith('.mpd');
}

/**
 * Get format from URL extension
 */
export function getFormatFromUrl(url: string): ManifestFormat | null {
  const cleanUrl = url.split('?')[0].toLowerCase();

  if (cleanUrl.endsWith('.m3u8')) {
    return 'hls';
  }

  if (cleanUrl.endsWith('.mpd')) {
    return 'dash';
  }

  return null;
}

/**
 * Scan DOM for manifest links
 */
export function scanDOMForManifests(): string[] {
  const manifests: string[] = [];

  // Check all links
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = (link as HTMLAnchorElement).href;
    if (isManifestUrl(href)) {
      manifests.push(href);
    }
  });

  // Check video sources
  document.querySelectorAll('video source[src], video[src]').forEach((video) => {
    const src = (video as HTMLVideoElement | HTMLSourceElement).src;
    if (src && isManifestUrl(src)) {
      manifests.push(src);
    }
  });

  // Deduplicate
  return Array.from(new Set(manifests));
}
