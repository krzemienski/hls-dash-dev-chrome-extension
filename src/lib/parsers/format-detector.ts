// src/lib/parsers/format-detector.ts
import type { ManifestFormat } from '../../types/manifest';

/**
 * Auto-detect manifest format from content
 *
 * DASH manifests are XML (start with < or <?xml)
 * HLS manifests are text (start with #EXTM3U)
 *
 * Adapted from: abr-manifest-viewer-chrome/viewer/js/main.js:62-65
 */
export function detectManifestFormat(content: string): ManifestFormat {
  const trimmed = content.trimStart();

  // Check for XML/DASH indicators
  if (trimmed.startsWith('<')) {
    return 'dash';
  }

  // Check for HLS header
  if (trimmed.startsWith('#EXTM3U')) {
    return 'hls';
  }

  // Fallback: check for XML anywhere in first 100 chars
  const start = trimmed.substring(0, 100);
  if (start.includes('<MPD') || start.includes('<?xml')) {
    return 'dash';
  }

  // Default to HLS
  return 'hls';
}
